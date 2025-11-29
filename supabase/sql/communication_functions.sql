-- Communication System - RPC Functions
-- Functions for messaging, conversations, and contact sharing

-- 1) create_conversation(participant_ids uuid[], job_id uuid) → conversation_id
CREATE OR REPLACE FUNCTION public.create_conversation(
  participant_ids uuid[],
  job_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  uid uuid := auth.uid();
  new_conversation_id uuid;
  existing_conversation_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Check if current user is in participant list
  IF NOT (uid = ANY(participant_ids)) THEN
    RAISE EXCEPTION 'Current user must be a participant';
  END IF;

  -- Check if conversation already exists between these participants (for 1-on-1)
  IF array_length(participant_ids, 1) = 2 THEN
    SELECT id INTO existing_conversation_id
    FROM public.conversations
    WHERE participant_ids @> participant_ids AND participant_ids <@ participant_ids
    LIMIT 1;

    IF existing_conversation_id IS NOT NULL THEN
      RETURN existing_conversation_id;
    END IF;
  END IF;

  -- Create new conversation
  INSERT INTO public.conversations (participant_ids, job_id)
  VALUES (participant_ids, job_id)
  RETURNING id INTO new_conversation_id;

  -- Add participants to conversation_participants table
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  SELECT new_conversation_id, unnest(participant_ids);

  RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2) send_message(conversation_id uuid, content text, message_type text, attachments jsonb) → message_id
CREATE OR REPLACE FUNCTION public.send_message(
  conversation_id uuid,
  content text,
  message_type text DEFAULT 'text',
  attachments jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid AS $$
DECLARE
  uid uuid := auth.uid();
  new_message_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Verify user is participant in conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND uid = ANY(c.participant_ids)
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  -- Insert message
  INSERT INTO public.messages (
    conversation_id,
    sender_id,
    content,
    message_type,
    attachments,
    read_by
  ) VALUES (
    conversation_id,
    uid,
    content,
    message_type,
    attachments,
    ARRAY[uid]::uuid[]  -- Sender has read their own message
  ) RETURNING id INTO new_message_id;

  RETURN new_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3) mark_messages_read(conversation_id uuid, up_to_message_id uuid) → success
CREATE OR REPLACE FUNCTION public.mark_messages_read(
  conversation_id uuid,
  up_to_message_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Verify user is participant
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND uid = ANY(c.participant_ids)
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  -- Update read_by array for all messages up to the specified message
  UPDATE public.messages
  SET read_by = array_append(read_by, uid)
  WHERE 
    messages.conversation_id = mark_messages_read.conversation_id
    AND NOT (uid = ANY(read_by))
    AND (
      up_to_message_id IS NULL OR
      sent_at <= (SELECT sent_at FROM public.messages WHERE id = up_to_message_id)
    );

  -- Update last_read_at for participant
  UPDATE public.conversation_participants
  SET last_read_at = now()
  WHERE conversation_participants.conversation_id = mark_messages_read.conversation_id
    AND user_id = uid;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4) get_conversations(limit_count integer, offset_count integer) → conversations[]
CREATE OR REPLACE FUNCTION public.get_conversations(
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  participant_ids uuid[],
  job_id uuid,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz,
  unread_count bigint
) AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    c.participant_ids,
    c.job_id,
    c.last_message_at,
    c.last_message_preview,
    c.created_at,
    (
      SELECT COUNT(*)
      FROM public.messages m
      WHERE m.conversation_id = c.id
        AND NOT (uid = ANY(m.read_by))
        AND m.sender_id != uid
    ) as unread_count
  FROM public.conversations c
  WHERE uid = ANY(c.participant_ids)
    AND NOT EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = c.id
        AND cp.user_id = uid
        AND cp.is_archived = true
    )
  ORDER BY c.last_message_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5) get_messages(conversation_id uuid, limit_count integer, offset_count integer) → messages[]
CREATE OR REPLACE FUNCTION public.get_messages(
  conversation_id uuid,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS SETOF public.messages AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Verify user is participant
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND uid = ANY(c.participant_ids)
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  RETURN QUERY
  SELECT m.*
  FROM public.messages m
  WHERE m.conversation_id = get_messages.conversation_id
    AND m.is_deleted = false
  ORDER BY m.sent_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6) search_messages(query text, conversation_id uuid) → messages[]
CREATE OR REPLACE FUNCTION public.search_messages(
  query text,
  conversation_id uuid DEFAULT NULL
)
RETURNS SETOF public.messages AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT m.*
  FROM public.messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  WHERE uid = ANY(c.participant_ids)
    AND m.is_deleted = false
    AND (conversation_id IS NULL OR m.conversation_id = search_messages.conversation_id)
    AND to_tsvector('english', m.content) @@ plainto_tsquery('english', query)
  ORDER BY m.sent_at DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7) request_contact_share(to_user_id uuid, conversation_id uuid) → request_id
CREATE OR REPLACE FUNCTION public.request_contact_share(
  to_user_id uuid,
  conversation_id uuid
)
RETURNS uuid AS $$
DECLARE
  uid uuid := auth.uid();
  new_request_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Verify both users are in the conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND uid = ANY(c.participant_ids)
      AND to_user_id = ANY(c.participant_ids)
  ) THEN
    RAISE EXCEPTION 'Both users must be participants in the conversation';
  END IF;

  -- Check if request already exists
  IF EXISTS (
    SELECT 1 FROM public.contact_shares_messaging
    WHERE from_user_id = uid
      AND contact_shares_messaging.to_user_id = request_contact_share.to_user_id
      AND contact_shares_messaging.conversation_id = request_contact_share.conversation_id
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Contact share request already pending';
  END IF;

  -- Create request
  INSERT INTO public.contact_shares_messaging (
    from_user_id,
    to_user_id,
    conversation_id,
    status
  ) VALUES (
    uid,
    to_user_id,
    conversation_id,
    'pending'
  ) RETURNING id INTO new_request_id;

  RETURN new_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8) respond_to_contact_share(request_id uuid, approved boolean) → contact_info jsonb
CREATE OR REPLACE FUNCTION public.respond_to_contact_share(
  request_id uuid,
  approved boolean
)
RETURNS jsonb AS $$
DECLARE
  uid uuid := auth.uid();
  requester_id uuid;
  contact_info jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Verify user is the recipient
  SELECT from_user_id INTO requester_id
  FROM public.contact_shares_messaging
  WHERE id = request_id AND to_user_id = uid AND status = 'pending';

  IF requester_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or already processed request';
  END IF;

  -- Update request status
  UPDATE public.contact_shares_messaging
  SET 
    status = CASE WHEN approved THEN 'approved' ELSE 'rejected' END,
    responded_at = now()
  WHERE id = request_id;

  -- If approved, return contact info
  IF approved THEN
    SELECT jsonb_build_object(
      'phone', p.phone,
      'email', u.email,
      'full_name', p.full_name
    ) INTO contact_info
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE u.id = uid;

    RETURN contact_info;
  ELSE
    RETURN '{}'::jsonb;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9) archive_conversation(conversation_id uuid) → success
CREATE OR REPLACE FUNCTION public.archive_conversation(conversation_id uuid)
RETURNS boolean AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.conversation_participants
  SET is_archived = true
  WHERE conversation_participants.conversation_id = archive_conversation.conversation_id
    AND user_id = uid;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10) mute_conversation(conversation_id uuid, muted boolean) → success
CREATE OR REPLACE FUNCTION public.mute_conversation(
  conversation_id uuid,
  muted boolean
)
RETURNS boolean AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.conversation_participants
  SET is_muted = muted
  WHERE conversation_participants.conversation_id = mute_conversation.conversation_id
    AND user_id = uid;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11) delete_message(message_id uuid) → success
CREATE OR REPLACE FUNCTION public.delete_message(message_id uuid)
RETURNS boolean AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Soft delete - mark as deleted
  UPDATE public.messages
  SET 
    is_deleted = true,
    content = '[Message deleted]'
  WHERE id = message_id AND sender_id = uid;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Comments for documentation
COMMENT ON FUNCTION public.create_conversation IS 'Creates a new conversation between users, optionally linked to a job';
COMMENT ON FUNCTION public.send_message IS 'Sends a message in a conversation';
COMMENT ON FUNCTION public.mark_messages_read IS 'Marks messages as read up to a specific message';
COMMENT ON FUNCTION public.get_conversations IS 'Retrieves user conversations with unread counts';
COMMENT ON FUNCTION public.get_messages IS 'Retrieves messages from a conversation';
COMMENT ON FUNCTION public.search_messages IS 'Searches messages by text query';
COMMENT ON FUNCTION public.request_contact_share IS 'Requests to share contact information';
COMMENT ON FUNCTION public.respond_to_contact_share IS 'Responds to a contact share request';
