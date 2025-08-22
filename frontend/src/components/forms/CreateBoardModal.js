import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiX, FiLock, FiUsers, FiGlobe } from 'react-icons/fi';
import { boardAPI } from '../../services/api';
import { BOARD_VISIBILITY, LABEL_COLORS } from '../../config/constants';
import LoadingSpinner from '../common/LoadingSpinner';
import './CreateBoardModal.css';

const CreateBoardSchema = Yup.object().shape({
  title: Yup.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  visibility: Yup.string()
    .oneOf(Object.values(BOARD_VISIBILITY), 'Invalid visibility')
    .required('Visibility is required'),
  workspaceId: Yup.string()
    .nullable(),
  background_color: Yup.string()
    .matches(/^#[0-9A-F]{6}$/i, 'Invalid color format')
});

const CreateBoardModal = ({ onClose, onBoardCreated, workspaces = [] }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundColors = [
    '#0079bf', '#026aa7', '#4c9aff', '#0065ff',
    '#6a4c93', '#9b59b6', '#e74c3c', '#c0392b',
    '#e67e22', '#f39c12', '#f1c40f', '#2ecc71',
    '#27ae60', '#16a085', '#1abc9c', '#34495e'
  ];

  const handleSubmit = async (values, { setFieldError }) => {
    try {
      setIsSubmitting(true);
      
      const boardData = {
        title: values.title.trim(),
        description: values.description?.trim() || '',
        visibility: values.visibility,
        background_color: values.background_color,
        workspaceId: values.workspaceId || null
      };

      const response = await boardAPI.createBoard(boardData);
      onBoardCreated(response.data.board);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create board';
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(field => {
          setFieldError(field, errors[field][0]);
        });
      } else {
        setFieldError('title', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
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
            visibility: BOARD_VISIBILITY.PRIVATE,
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

              <div className="form-section">
                <div className="form-group">
                  <label>Visibility</label>
                  <div className="visibility-options">
                    <div
                      className={`visibility-option ${values.visibility === BOARD_VISIBILITY.PRIVATE ? 'selected' : ''}`}
                      onClick={() => setFieldValue('visibility', BOARD_VISIBILITY.PRIVATE)}
                    >
                      <div className="visibility-icon">
                        <FiLock />
                      </div>
                      <div className="visibility-content">
                        <h4>Private</h4>
                        <p>Only you and invited members can see this board</p>
                      </div>
                    </div>

                    <div
                      className={`visibility-option ${values.visibility === BOARD_VISIBILITY.WORKSPACE ? 'selected' : ''}`}
                      onClick={() => setFieldValue('visibility', BOARD_VISIBILITY.WORKSPACE)}
                    >
                      <div className="visibility-icon">
                        <FiUsers />
                      </div>
                      <div className="visibility-content">
                        <h4>Workspace</h4>
                        <p>All workspace members can see and edit this board</p>
                      </div>
                    </div>

                    <div
                      className={`visibility-option ${values.visibility === BOARD_VISIBILITY.PUBLIC ? 'selected' : ''}`}
                      onClick={() => setFieldValue('visibility', BOARD_VISIBILITY.PUBLIC)}
                    >
                      <div className="visibility-icon">
                        <FiGlobe />
                      </div>
                      <div className="visibility-content">
                        <h4>Public</h4>
                        <p>Anyone on the internet can see this board</p>
                      </div>
                    </div>
                  </div>
                  <ErrorMessage name="visibility" component="div" className="field-error" />
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
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="create-btn"
                  disabled={isSubmitting || !values.title.trim()}
                >
                  {isSubmitting ? (
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
