import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCreateBoard } from '../../hooks/useBoards';
import LoadingSpinner from '../common/LoadingSpinner';
import './CreateBoardModal.css';

const CreateBoardSchema = Yup.object().shape({
  title: Yup.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  workspaceId: Yup.string()
    .nullable(),
  background_color: Yup.string()
    .matches(/^#[0-9A-F]{6}$/i, 'Invalid color format')
});

const CreateBoardModal = ({ onClose, onBoardCreated, workspaces = [] }) => {
  const createBoardMutation = useCreateBoard();

  const backgroundColors = [
    '#0079bf', '#026aa7', '#4c9aff', '#0065ff',
    '#6a4c93', '#9b59b6', '#e74c3c', '#c0392b',
    '#e67e22', '#f39c12', '#f1c40f', '#2ecc71',
    '#27ae60', '#16a085', '#1abc9c', '#34495e'
  ];

  const handleSubmit = async (values, { setFieldError }) => {
    try {
      const boardData = {
        title: values.title.trim(),
        description: values.description?.trim() || '',
        color: values.background_color,
        workspaceId: values.workspaceId ? parseInt(values.workspaceId) : undefined
      };

      console.log('Creating board with React Query mutation:', boardData);
      
      const newBoard = await createBoardMutation.mutateAsync(boardData);
      console.log('Board created successfully:', newBoard);
      
      // Call the callback with the new board
      if (onBoardCreated) {
        onBoardCreated(newBoard);
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Board creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create board';
      
      // Show error toast
      toast.error('Unable to create board. Please try again.');
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(field => {
          setFieldError(field, errors[field][0]);
        });
      } else {
        setFieldError('title', errorMessage);
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="create-board-modal">
        <div className="modal-header">
          <h2>Create Board</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <Formik
          initialValues={{
            title: '',
            description: '',
            workspaceId: '',
            background_color: backgroundColors[0]
          }}
          validationSchema={CreateBoardSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, touched, errors }) => (
            <Form className="modal-form">
              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="title">Board Title *</label>
                  <Field
                    type="text"
                    name="title"
                    id="title"
                    placeholder="Enter board title"
                    className={`form-input ${touched.title && errors.title ? 'error' : ''}`}
                  />
                  <ErrorMessage name="title" component="div" className="field-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <Field
                    as="textarea"
                    name="description"
                    id="description"
                    placeholder="What's this board about? (optional)"
                    className={`form-textarea ${touched.description && errors.description ? 'error' : ''}`}
                    rows="3"
                  />
                  <ErrorMessage name="description" component="div" className="field-error" />
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>Background Color</label>
                  <div className="color-picker">
                    {backgroundColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${values.background_color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFieldValue('background_color', color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {workspaces.length > 0 && (
                <div className="form-section">
                  <div className="form-group">
                    <label htmlFor="workspaceId">Workspace (Optional)</label>
                    <Field
                      as="select"
                      name="workspaceId"
                      id="workspaceId"
                      className="form-select"
                    >
                      <option value="">No workspace (Personal board)</option>
                      {workspaces.map(workspace => (
                        <option key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="workspaceId" component="div" className="field-error" />
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={onClose}
                  disabled={createBoardMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="create-btn"
                  disabled={createBoardMutation.isPending || !values.title.trim()}
                >
                  {createBoardMutation.isPending ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    'Create Board'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateBoardModal;
