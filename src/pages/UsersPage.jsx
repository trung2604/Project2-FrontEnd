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
    const response = await getAllUserAPI(current, pageSize);
    if (response.data) {
      setData(response.data.result);
      setTotal(response.data.meta.total);
      setCurrent(response.data.meta.current);
      setPageSize(response.data.meta.pageSize);
      console.log(response.data.meta);
    }
  }
  return(
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


