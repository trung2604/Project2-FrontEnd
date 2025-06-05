import { useEffect, useState } from "react";
import { getAllBookAPI } from "../services/api-service";
import BookList from "../components/book/BookList";
import BookForm from "../components/book/BookForm";

const BooksPage = () => {
    const [data, setData] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        loadBooks();
    }, [current, pageSize, refreshTrigger]);

    const loadBooks = async () => {
        const response = await getAllBookAPI(current, pageSize);
        if (response?.data) {
            setData(response.data.content || []);
            setTotal(response.data.totalElements || 0);
            setCurrent(response.data.number + 1);
            setPageSize(response.data.size || 10);
        } else {
            setData([]);
            setTotal(0);
        }
    };

    return (
        <div>
            <BookForm loadBooks={loadBooks} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} setRefreshTrigger={setRefreshTrigger} />
            <BookList
                data={data}
                loadBooks={loadBooks}
                current={current}
                pageSize={pageSize}
                total={total}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                setRefreshTrigger={setRefreshTrigger}
                refreshTrigger={refreshTrigger}
            />
        </div>
    );
};

export default BooksPage; 