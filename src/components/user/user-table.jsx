import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, notification, Popconfirm, Table } from 'antd';
import UpdateUser from './update-user';
import { useState } from 'react';
import ViewUserDetails from './view-user-details';
import { deleteUserAPI } from '../../services/api-service';
const UserTable = ({ data, loadUser, current, pageSize, total, setCurrent, setPageSize }) => {
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [dataUpdate, setDataUpdate] = useState(null);
  const [dataDetails, setDataDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const handleConfirmDelete = async (id) => {
    try {
      console.log('Deleting user with id:', id);
      const response = await deleteUserAPI(id);
      console.log('Delete API response:', response);
      console.log('Response data:', response?.data);
      console.log('Response status:', response?.status);

      if (response?.status === 200 || response?.data?.success === true) {
        notification.success({
          message: "Delete User",
          description: response?.data?.message || "User deleted successfully"
        });
        if (isDetailsOpen) {
          setIsDetailsOpen(false);
          setDataDetails(null);
        }
        await loadUser();
      } else {
        notification.error({
          message: "Delete User",
          description: response?.data?.message || "Xóa người dùng thất bại. Vui lòng thử lại."
        });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      console.error('Error response:', error?.response);
      notification.error({
        message: "Delete User",
        description: error?.response?.data?.message || "Xóa người dùng thất bại. Vui lòng thử lại."
      });
    }
  }

  const columns = [
    {
      title: 'STT',
      render: (_, record, index) => (
        <span>{(index + 1) + (current - 1) * pageSize}</span>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      render: (_, record) => (
        <a href="#" onClick={() => {
          setIsDetailsOpen(true)
          setDataDetails(record)
        }}> {record.id}</a>
      ),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '20px' }}>
          <EditOutlined style={{ color: 'blue', cursor: 'pointer' }} onClick={() => {
            setIsModalUpdateOpen(true)
            setDataUpdate(record)
          }} />
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this task?"
            onConfirm={() => {
              handleConfirmDelete(record.id)
            }}
            onCancel={() => { }}
            okText="Yes"
            cancelText="No"
            placement="left"
          >
            <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
          </Popconfirm>
        </div>
      ),
    }
  ];
  const handleChangePage = (pagination, filters, sorter, extra) => {
    if (pagination && pagination.current && pagination.pageSize) {
      if (+pagination.current !== +current) {
        setCurrent(+pagination.current);
      }
      if (+pagination.pageSize !== +pageSize) {
        setPageSize(+pagination.pageSize);
      }
    }
  }
  return (
    <>
      <Table columns={columns}
        dataSource={data} rowKey="id"
        pagination={{
          current: current,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleChangePage}
      />
      <UpdateUser
        isModalUpdateOpen={isModalUpdateOpen}
        setIsModalUpdateOpen={setIsModalUpdateOpen}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        loadUser={loadUser} />
      <ViewUserDetails
        isDetailsOpen={isDetailsOpen}
        setIsDetailsOpen={setIsDetailsOpen}
        dataDetails={dataDetails}
        setDataDetails={setDataDetails}
        loadUser={loadUser}
      />
    </>
  );
};

export default UserTable;


