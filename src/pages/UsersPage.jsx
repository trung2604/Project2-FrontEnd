import UserTable from "../components/user/user-table";
import UserForm from "../components/user/user-form";
import { useEffect, useState } from "react";
import { getAllUserAPI } from "../services/api-service";
const UsersPage = () => {
  const [data, setData] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    loadUser();
  }, [current, pageSize]);
  const loadUser = async () => {
    console.log('Loading users with params:', { current, pageSize });
    const response = await getAllUserAPI(current, pageSize);
    console.log('Load users response:', response);
    console.log('Response data:', response?.data);
    if (response.data) {
      console.log('Setting user data:', response.data.result);
      setData(response.data.result);
      setTotal(response.data.meta.total);
      setCurrent(response.data.meta.current);
      setPageSize(response.data.meta.pageSize);
    }
  }
  return (
    <div>
      <UserForm loadUser={loadUser} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      <UserTable data={data}
        loadUser={loadUser}
        current={current}
        pageSize={pageSize}
        total={total}
        setCurrent={setCurrent}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default UsersPage;


