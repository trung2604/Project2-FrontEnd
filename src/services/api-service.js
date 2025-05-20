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
    if (book.file) formData.append('file', book.file);
    formData.append('mainText', book.title);
    formData.append('author', book.author);
    formData.append('price', book.price);
    formData.append('sold', book.sold || 0);
    formData.append('quantity', book.quantity);
    if (Array.isArray(book.category)) {
        book.category.forEach(cat => formData.append('category', cat));
    } else {
        formData.append('category', book.category);
    }
    return axios.post(URL_BACKEND, formData);
};

const updateBookAPI = (book) => {
    const URL_BACKEND = "/api/bookStore/book/update";
    const formData = new FormData();
    formData.append('id', book.id);
    if (book.file) formData.append('file', book.file);
    formData.append('mainText', book.title);
    formData.append('author', book.author);
    formData.append('price', book.price);
    formData.append('sold', book.sold || 0);
    formData.append('quantity', book.quantity);
    if (Array.isArray(book.category)) {
        book.category.forEach(cat => formData.append('category', cat));
    } else {
        formData.append('category', book.category);
    }
    return axios.put(URL_BACKEND, formData);
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
    getCartItemsAPI
};
