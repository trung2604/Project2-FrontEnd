import axios from "./axios-customize";

const createUserAPI = (fullName, email, password, phoneNumber) => {
    const URL_BACKEND = "/api/bookStore/user";
    return axios.post(`${URL_BACKEND}/register`, {
        fullName,
        email,
        password,
        phoneNumber
    });
}

const getAllUserAPI = (current, pageSize) => {
    const URL_BACKEND = `/api/bookStore/user/paged?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

const updateUserAPI = (id, fullName, phone) => {
    const URL_BACKEND = "/api/bookStore/user/update";
    return axios.put(URL_BACKEND, {
        id,
        fullName,
        phone
    });
}

const deleteUserAPI = (id) => {
    const URL_BACKEND = `/api/bookStore/user/delete/${id}`;
    return axios.delete(URL_BACKEND);
}

const updateAvatarAPI = (avatar, userId) => {
    const URL_BACKEND = `/api/bookStore/user/avatar/upload`;
    let config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }
    const bodyFormData = new FormData();
    bodyFormData.append('file', avatar);
    bodyFormData.append('userId', userId);
    return axios.post(URL_BACKEND, bodyFormData, config);
}
const registerAPI = (fullName, email, password, phoneNumber) => {
    const URL_BACKEND = "/api/bookStore/user/register";
    return axios.post(URL_BACKEND, {
        fullName,
        email,
        password,
        phoneNumber
    });
}

const loginAPI = (email, password) => {
    const URL_BACKEND = "/api/bookStore/user/login";
    return axios.post(URL_BACKEND, {
        email,
        password
    });
}

const getAccountAPI = () => {
    const URL_BACKEND = "/api/bookStore/user/account";
    return axios.get(URL_BACKEND);
}

const logoutAPI = () => {
    const URL_BACKEND = "/api/bookStore/user/logout";
    return axios.post(URL_BACKEND);
}

const getAllBookAPI = (current, pageSize) => {
    const URL_BACKEND = `/api/bookStore/book/paged?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

const addBookAPI = (book) => {
    const URL_BACKEND = "/api/bookStore/book/add";
    const formData = new FormData();
    const bookData = {
        mainText: book.title,
        author: book.author,
        price: book.price,
        sold: book.sold || 0,
        quantity: book.quantity,
        categoryName: book.categoryName
    };
    formData.append('book', new Blob([JSON.stringify(bookData)], { type: 'application/json' }));
    if (book.file) {
        formData.append('imageFile', book.file);
    }
    return axios.post(URL_BACKEND, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const updateBookAPI = (id, bookData, file = null) => {
    const URL_BACKEND = `/api/bookStore/book/${id}`;
    const formData = new FormData();

    // Thêm book data vào formData
    formData.append('bookData', new Blob([JSON.stringify(bookData)], {
        type: 'application/json'
    }));

    // Thêm file nếu có
    if (file) {
        formData.append('imageFile', file);
    }

    return axios.put(URL_BACKEND, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const deleteBookAPI = (id) => {
    const URL_BACKEND = `/api/bookStore/book/delete/${id}`;
    return axios.delete(URL_BACKEND);
}
const updateBookImageAPI = (id, image) => {
    const URL_BACKEND = `/api/bookStore/book/image/upload`;
    let config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }
    const bodyFormData = new FormData();
    bodyFormData.append('file', image);
    bodyFormData.append('id', id);
    return axios.post(URL_BACKEND, bodyFormData, config);
}

const getUserByIdAPI = (id) => {
    const URL_BACKEND = `/api/bookStore/user/${id}`;
    return axios.get(URL_BACKEND);
}

// Cart APIs
const addToCartAPI = (bookId, quantity) => {
    return axios.post("/api/bookStore/cart/add", { bookId, quantity });
};

const removeCartItemAPI = (bookId) => {
    return axios.delete(`/api/bookStore/cart/remove/${bookId}`);
};

const clearCartAPI = () => {
    return axios.delete("/api/bookStore/cart/clear");
};

const getCartItemsAPI = () => {
    return axios.get("/api/bookStore/cart/items");
};

const getCartItemAPI = (bookId) => {
    return axios.get(`/api/bookStore/cart/item/${bookId}`);
};

const updateCartItemAPI = (bookId, quantity) => {
    if (typeof bookId !== 'string' || bookId.trim() === '') {
        return Promise.reject(new Error('Invalid input: bookId must be a non-empty string'));
    }

    if (typeof quantity !== 'number' || isNaN(quantity) || quantity < 1) {
        return Promise.reject(new Error('Invalid input: quantity must be a number greater than or equal to 1'));
    }

    return axios.put("/api/bookStore/cart/update", {
        bookId,
        quantity
    });
};

// Category APIs
const getAllCategoriesAPI = (params = {}) => {
    const URL_BACKEND = "/api/bookStore/category";
    return axios.get(URL_BACKEND, {
        params: {
            page: params.page || 0,
            size: params.size || 10
        }
    });
};

const getCategoryByIdAPI = (categoryId) => {
    const URL_BACKEND = `/api/bookStore/category/${categoryId}`;
    return axios.get(URL_BACKEND);
};

const createCategoryAPI = (data) => {
    const URL_BACKEND = "/api/bookStore/category/add";
    return axios.post(URL_BACKEND, {
        name: data.name,
        description: data.description
    });
};

const updateCategoryAPI = (categoryId, data) => {
    const URL_BACKEND = `/api/bookStore/category/update/${categoryId}`;
    return axios.put(URL_BACKEND, {
        name: data.name,
        description: data.description
    });
};

const deleteCategoryAPI = (categoryId) => {
    const URL_BACKEND = `/api/bookStore/category/delete/${categoryId}`;
    return axios.delete(URL_BACKEND);
};

const searchCategoriesAPI = (keyword) => {
    const URL_BACKEND = "/api/bookStore/category/search";
    return axios.get(URL_BACKEND, {
        params: { keyword }
    });
};

// Order APIs
export const createOrderAPI = async (orderData) => {
    return await axios.post('/api/bookStore/orders', orderData);
};

export const getOrderDetailAPI = async (orderId) => {
    return await axios.get(`/api/bookStore/orders/${orderId}`);
};

export const getUserOrdersAPI = async (params) => {
    // params: { page, size, sort }
    return await axios.get('/api/bookStore/orders/user', { params });
};

export const getAllOrdersAPI = async (params) => {
    // params: { page, size, sort, status, search }
    return await axios.get('/api/bookStore/orders/admin', { params });
};

export const updateOrderStatusAPI = async (orderId, status) => {
    return await axios.put(`/api/bookStore/orders/${orderId}/status?status=${status}`);
};

export const cancelOrderAPI = async (orderId) => {
    return await axios.post(`/api/bookStore/orders/${orderId}/cancel`);
};

export const getBooksByCategoryAPI = (categoryId) => {
    return axios.get(`/api/bookStore/book/category/${categoryId}`);
};

export const getBookCountByCategoryAPI = () => {
    return axios.get('/api/bookStore/category/category-count');
};

export const confirmOrderAPI = async (orderId) => {
    return await axios.post(`/api/bookStore/orders/${orderId}/confirm`);
};

export const getShipperOrdersAPI = async (params) => {
    return await axios.get('/api/bookStore/orders/shipper', { params });
};

export const startShippingOrderAPI = async (orderId) => {
    return await axios.post(`/api/bookStore/orders/${orderId}/shipping`);
};

export const deliveredOrderAPI = async (orderId) => {
    return await axios.post(`/api/bookStore/orders/${orderId}/delivered`);
};

export {
    createUserAPI,
    getAllUserAPI,
    updateUserAPI,
    deleteUserAPI,
    updateAvatarAPI,
    registerAPI,
    loginAPI,
    getAccountAPI,
    logoutAPI,
    getAllBookAPI,
    addBookAPI,
    updateBookAPI,
    deleteBookAPI,
    updateBookImageAPI,
    getUserByIdAPI,
    updateCartItemAPI,
    getCartItemAPI,
    addToCartAPI,
    removeCartItemAPI,
    clearCartAPI,
    getCartItemsAPI,
    getAllCategoriesAPI,
    getCategoryByIdAPI,
    createCategoryAPI,
    updateCategoryAPI,
    deleteCategoryAPI,
    searchCategoriesAPI
};
