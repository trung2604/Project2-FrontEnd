import { Button, Drawer, notification, Spin } from "antd";
import './user-detail.css';
import Avatar from '../common/Avatar';
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { updateAvatarAPI, getUserByIdAPI } from "../../services/api-service";
import UpdateUser from './update-user';

const ViewUserDetails = ({ isDetailsOpen, setIsDetailsOpen, dataDetails, setDataDetails, loadUser, reloadCurrentUser }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    // Hàm load lại user chi tiết
    const loadUserDetail = async () => {
        if (dataDetails && dataDetails.id) {
            const res = await getUserByIdAPI(dataDetails.id);
            if (res && res.data) {
                setDataDetails(res.data);
                if (reloadCurrentUser) reloadCurrentUser();
            }
        }
    };

    const handleOnChangeFile = (e) => {
        if (!e.target.files[0] && e.target.files[0] === 0) {
            setSelectedFile(null);
            setPreview(null);
            return;
        }
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    const handleUploadAvatar = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const response = await updateAvatarAPI(selectedFile, dataDetails.id);
            if (response.success === true) {
                setDataDetails({});
                setPreview(null);
                setSelectedFile(null);
                setIsDetailsOpen(false);
                notification.success({
                    message: "Update Avatar",
                    description: "Avatar updated successfully"
                });
                await loadUserDetail();
                return;
            } else {
                notification.error({
                    message: "Update Avatar",
                    description: "Avatar updated failed"
                });
            }
        } catch (error) {
            notification.error({
                message: "Update Avatar",
                description: error?.response?.data?.message || "Avatar updated failed"
            });
            console.log(error);
        } finally {
            setIsUploading(false);
        }
    }

    const handleCancel = () => {
        setSelectedFile(null);
        setPreview(null);
        // Reset file input
        const fileInput = document.getElementById('btn-avatar');
        if (fileInput) fileInput.value = '';
    }

    return (
        <Drawer
            title="User Details"
            closable={{ 'aria-label': 'Close Button' }}
            onClose={() => {
                setIsDetailsOpen(false);
                setDataDetails();
                handleCancel();
            }}
            open={isDetailsOpen}
            width={600}
        >
            <div className="user-detail-container">
                {dataDetails ? (
                    <>
                        <div className="user-detail-header">
                            <Avatar
                                avatar={dataDetails.avatar}
                                size="large"
                                alt={`${dataDetails.fullName}'s avatar`}
                                className="user-detail-avatar"
                            />
                            <h2 className="user-detail-title">{dataDetails.fullName}</h2>
                            <Button
                                type="primary"
                                className="edit-btn"
                                onClick={() => {
                                    setIsModalUpdateOpen(true);
                                    setDataUpdate(dataDetails);
                                }}
                            >
                                Chỉnh sửa
                            </Button>
                        </div>
                        <div className="user-detail-content">
                            <div className="user-detail-item">
                                <span className="user-detail-label">ID</span>
                                <div className="user-detail-value">{dataDetails.id}</div>
                            </div>
                            <div className="user-detail-item">
                                <span className="user-detail-label">Email</span>
                                <div className="user-detail-value">{dataDetails.email}</div>
                            </div>
                            <div className="user-detail-item">
                                <span className="user-detail-label">Phone Number</span>
                                <div className="user-detail-value">{dataDetails.phone}</div>
                            </div>
                            <div className="user-detail-item">
                                <span className="user-detail-label">Role</span>
                                <div className="user-detail-value">
                                    <span className="role-badge">{dataDetails.role}</span>
                                </div>
                            </div>
                            <div className="user-detail-item">
                                <span className="user-detail-label">Status</span>
                                <div className="user-detail-value">
                                    <span className={`status-badge ${dataDetails.active ? 'active' : 'inactive'}`}>
                                        {dataDetails.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div className="user-detail-item">
                                <span className="user-detail-label">Last Updated</span>
                                <div className="user-detail-value">
                                    {new Date(dataDetails.updatedAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="avatar-upload-container">
                            <div className="avatar-upload-wrapper">
                                <label
                                    htmlFor="btn-avatar"
                                    className={`avatar-upload-label ${isUploading ? 'disabled' : ''}`}
                                >
                                    <UploadOutlined />
                                    Upload Avatar
                                </label>
                                <input
                                    type="file"
                                    id="btn-avatar"
                                    hidden
                                    accept="image/*"
                                    onChange={handleOnChangeFile}
                                    disabled={isUploading}
                                />
                            </div>
                            {preview && (
                                <div className={`avatar-preview-container ${isUploading ? 'avatar-upload-loading' : ''}`}>
                                    <img src={preview} alt="Avatar Preview" />
                                    {isUploading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
                                </div>
                            )}
                            {preview && !isUploading && (
                                <div className="avatar-upload-actions">
                                    <Button onClick={handleCancel}>Cancel</Button>
                                    <Button type="primary" onClick={handleUploadAvatar}>
                                        Save
                                    </Button>
                                </div>
                            )}
                        </div>
                        <UpdateUser
                            isModalUpdateOpen={isModalUpdateOpen}
                            setIsModalUpdateOpen={setIsModalUpdateOpen}
                            dataUpdate={dataUpdate}
                            setDataUpdate={setDataUpdate}
                            loadUser={loadUserDetail}
                        />
                    </>
                ) : (
                    <div className="no-data-message">No data available</div>
                )}
            </div>
        </Drawer>
    )
}

export default ViewUserDetails; 