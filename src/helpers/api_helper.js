/* eslint-disable no-debugger */
import axios from "axios";
import { api } from "../config";
import { message } from "antd";
import { Redirect } from "react-router-dom";

// default
axios.defaults.baseURL = api.API_URL;
// content type
axios.defaults.headers.post["Content-Type"] = "application/json";

// credentials
// axios.defaults.withCredentials = true;

const urlRefreshToken = "/api/users/refresh-token";
// content type
const token = JSON.parse(sessionStorage.getItem("authUser"))
  ? JSON.parse(sessionStorage.getItem("authUser")).token
  : null;
if (token) axios.defaults.headers.common["Authorization"] = "Bearer " + token;

// intercepting to capture errors
axios.interceptors.response.use(
  function (response) {
    return response.data ? response.data : response;
  },
  function (error) {
    if (error.response.data === "Forbidden") {
      message.error(`Don't have permission!`);
    }

    if (error.response.data.data.name === "TokenExpiredError") {
      message.error(`Please login to continue!`);
      setTimeout(() => {
        window.location.replace("/logout");
      }, 3000);
    }

    return Promise.reject();
  }
);
/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

class APIClient {
  /**
   * Fetches data from given url
   */

  // get = (url, params) => {
  //   return axios.get(url, params);
  // };

  get = async (url, params) => {
    let response;

    let paramKeys = [];
    const token = JSON.parse(sessionStorage.getItem("authUser"))
      ? JSON.parse(sessionStorage.getItem("authUser")).token
      : null;
    if (token)
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    if (params) {
      Object.keys(params).map((key) => {
        paramKeys.push(key + "=" + params[key]);
        return paramKeys;
      });
      const queryString =
        paramKeys && paramKeys.length ? paramKeys.join("&") : "";
      await axios
        .get(`${url}?${queryString}`, params)
        .then(function (res) {
          response = res;
        })
        .catch(function (error) {
          console.error(error);
        });
    } else {
      await axios
        .get(`${url}`, params)
        .then(function (res) {
          response = res;
        })
        .catch(function (error) {
          if (error === "Request failed with status code 401") {
            axios
              .post(`${urlRefreshToken}`, null)
              .then((res) => {
                var abc = true;
              })
              .catch((err) => {
                var cb = true;
              });
          }
        });
    }
    return response;
  };
  /**
   * post given data to url
   */
  create = (url, data) => {
    return axios.post(url, data);
  };
  /**
   * Updates data
   */
  update = (url, data) => {
    return axios.put(url, data);
  };
  /**
   * Delete
   */
  delete = (url, config) => {
    return axios.delete(url, { ...config });
  };

  createWithFormData = (url, data) => {
    let formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return axios.post(url, formData, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
  };

  updateWithFormData = (url, data) => {
    let formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return axios.put(url, formData, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
  };
}
const getLoggedinUser = () => {
  const user = sessionStorage.getItem("authUser");
  if (!user) {
    return null;
  } else {
    return JSON.parse(user);
  }
};

export { APIClient, setAuthorization, getLoggedinUser };
