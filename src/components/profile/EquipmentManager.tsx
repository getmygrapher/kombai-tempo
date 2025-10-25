import React, { useState } from 'react';
import {
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import { EquipmentItem, EquipmentCategory } from '../../types';
import { mockEquipmentOptions, formatEquipmentCount } from '../../data/profileManagementMockData';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  }
}));

const EquipmentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  }
}));

interface EquipmentManagerProps {
  equipment: EquipmentItem[];
  onEquipmentUpdate: (equipment: EquipmentItem[]) => void;
  onBack: () => void;
}

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({
  equipment,
  onEquipmentUpdate,
  onBack
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<EquipmentItem>>({
    category: EquipmentCategory.CAMERAS,
    name: '',
    description: '',
    isIndoorCapable: true,
    isOutdoorCapable: true,
  });
  const [successMessage, setSuccessMessage] = useState('');

  const equipmentCategories = [
    {
      id: EquipmentCategory.CAMERAS,
      title: 'Cameras',
      icon: <PhotoCameraOutlinedIcon />,
      color: 'primary',
      description: 'Primary and secondary cameras'
    },
    {
      id: EquipmentCategory.LENSES,
      title: 'Lenses',
      icon: <PhotoCameraOutlinedIcon />,
      color: 'secondary',
      description: 'Camera lenses and filters'
    },
    {
      id: EquipmentCategory.LIGHTING,
      title: 'Lighting',
      icon: <LightbulbOutlinedIcon />,
      color: 'warning',
      description: 'Lighting equipment and accessories'
    },
    {
      id: EquipmentCategory.SUPPORT_GEAR,
      title: 'Support Gear',
      icon: <BuildOutlinedIcon />,
      color: 'info',
      description: 'Tripods, gimbals, and stabilizers'
    },
    {
      id: EquipmentCategory.OTHER,
      title: 'Other Equipment',
      icon: <BuildOutlinedIcon />,
      color: 'success',
      description: 'Custom equipment and accessories'
    }
  ];

  const getEquipmentByCategory = (category: EquipmentCategory) => {
    return equipment.filter(item => item.category === category);
  };

  const handleAddEquipment = () => {
    if (!newItem.name?.trim()) return;

    const equipmentItem: EquipmentItem = {
      id: Date.now().toString(),
      category: newItem.category!,
      name: newItem.name.trim(),
      description: newItem.description?.trim(),
      isIndoorCapable: newItem.isIndoorCapable,
      isOutdoorCapable: newItem.isOutdoorCapable,
    };

    onEquipmentUpdate([...equipment, equipmentItem]);
    setNewItem({
      category: EquipmentCategory.CAMERAS,
      name: '',
      description: '',
      isIndoorCapable: true,
      isOutdoorCapable: true,
    });
    setIsAddDialogOpen(false);
    setSuccessMessage('Equipment added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEditEquipment = () => {
    if (!editingItem || !editingItem.name?.trim()) return;

    const updatedEquipment = equipment.map(item =>
      item.id === editingItem.id ? editingItem : item
    );

    onEquipmentUpdate(updatedEquipment);
    setEditingItem(null);
    setIsEditDialogOpen(false);
    setSuccessMessage('Equipment updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteEquipment = (itemId: string) => {
    const updatedEquipment = equipment.filter(item => item.id !== itemId);
    onEquipmentUpdate(updatedEquipment);
    setSuccessMessage('Equipment removed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const openEditDialog = (item: EquipmentItem) => {
    setEditingItem({ ...item });
    setIsEditDialogOpen(true);
  };

  const getPresetOptions = (category: EquipmentCategory) => {
    switch (category) {
      case EquipmentCategory.CAMERAS:
        return mockEquipmentOptions.cameras;
      case EquipmentCategory.LENSES:
        return mockEquipmentOptions.lenses;
      case EquipmentCategory.LIGHTING:
        return mockEquipmentOptions.lighting;
      case EquipmentCategory.SUPPORT_GEAR:
        return mockEquipmentOptions.supportGear;
      default:
        return [];
    }
  };

  if (selectedCategory) {
    const categoryEquipment = getEquipmentByCategory(selectedCategory);
    const categoryInfo = equipmentCategories.find(cat => cat.id === selectedCategory);

    return (
      <StyledContainer>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Button onClick={() => setSelectedCategory(null)} sx={{ mb: 2 }}>
              ← Back to Categories
            </Button>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {categoryInfo?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {categoryInfo?.description}
            </Typography>
          </Box>

          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {/* Add Equipment Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setNewItem({ ...newItem, category: selectedCategory });
              setIsAddDialogOpen(true);
            }}
          >
            Add {categoryInfo?.title}
          </Button>

          {/* Equipment List */}
          <Paper>
            {categoryEquipment.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No {categoryInfo?.title.toLowerCase()} added yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click "Add {categoryInfo?.title}" to get started
                </Typography>
              </Box>
            ) : (
              <List>
                {categoryEquipment.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <Stack spacing={1}>
                            {item.description && (
                              <Typography variant="body2" color="text.secondary">
                                {item.description}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={1}>
                              {item.isIndoorCapable && (
                                <Chip label="Indoor" size="small" variant="outlined" />
                              )}
                              {item.isOutdoorCapable && (
                                <Chip label="Outdoor" size="small" variant="outlined" />
                              )}
                            </Stack>
                          </Stack>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => openEditDialog(item)}
                          sx={{ mr: 1 }}
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteEquipment(item.id)}
                          color="error"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < categoryEquipment.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Stack>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Button onClick={onBack} sx={{ mb: 2 }}>
            ← Back to Profile
          </Button>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Equipment & Gear
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your photography equipment and gear
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {/* Equipment Categories */}
        <Stack spacing={2}>
          {equipmentCategories.map((category) => {
            const categoryEquipment = getEquipmentByCategory(category.id);
            
            return (
              <CategoryCard
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ color: `${category.color}.main` }}>
                      {category.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="medium">
                        {category.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatEquipmentCount(categoryEquipment.length)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CategoryCard>
            );
          })}
        </Stack>

        {/* Add Equipment Dialog */}
        <Dialog open={isAddDialogOpen as any} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Equipment</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as EquipmentCategory })}
                  label="Category"
                >
                  {equipmentCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Equipment Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
                fullWidth
              />

              <TextField
                label="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                multiline
                rows={2}
                placeholder="Optional description..."
                fullWidth
              />

              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newItem.isIndoorCapable}
                      onChange={(e) => setNewItem({ ...newItem, isIndoorCapable: e.target.checked })}
                    />
                  }
                  label="Indoor Capable"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newItem.isOutdoorCapable}
                      onChange={(e) => setNewItem({ ...newItem, isOutdoorCapable: e.target.checked })}
                    />
                  }
                  label="Outdoor Capable"
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEquipment} variant="contained">
              Add Equipment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Equipment Dialog */}
        <Dialog open={isEditDialogOpen as any} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Equipment</DialogTitle>
          <DialogContent>
            {editingItem && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Equipment Name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  required
                  fullWidth
                />

                <TextField
                  label="Description"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  multiline
                  rows={2}
                  fullWidth
                />

                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingItem.isIndoorCapable}
                        onChange={(e) => setEditingItem({ ...editingItem, isIndoorCapable: e.target.checked })}
                      />
                    }
                    label="Indoor Capable"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingItem.isOutdoorCapable}
                        onChange={(e) => setEditingItem({ ...editingItem, isOutdoorCapable: e.target.checked })}
                      />
                    }
                    label="Outdoor Capable"
                  />
                </Stack>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditEquipment} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </StyledContainer>
  );
};