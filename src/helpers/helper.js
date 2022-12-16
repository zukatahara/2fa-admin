import { APIClient } from "./api_helper";
import * as url from "./url_helper";

const api = new APIClient();

export const getLoggedInUser = () => {
  const user = sessionStorage.getItem("user");
  if (user) return JSON.parse(user);
  return null;
};

export const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};

//login
export const postLogin = (data) => api.create(url.API_USER_LOGIN, data);

//Tags
export const insertTags = (data) => api.create(url.API_TAG_INSERT, data);
export const getPagingTags = (data) => api.get(url.API_TAG_GET_PAGING, data);
export const updateTags = (id, data) =>
  api.update(`${url.API_TAG_UPDATE}/${id}`, data);
export const deleteTags = (id, data) =>
  api.delete(`${url.API_TAG_DELETE}/${id}`, data);

//Category
export const insertCategorys = (data) =>
  api.create(url.API_CATEGORY_INSERT, data);
export const getPagingCategorys = (data) =>
  api.get(url.API_CATEGORY_GET_PAGING, data);
export const updateCategorys = (id, data) =>
  api.update(`${url.API_CATEGORY_UPDATE}/${id}`, data);
export const deleteCategorys = (id, data) =>
  api.delete(`${url.API_CATEGORY_DELETE}/${id}`, data);
export const getPagingCategorysById = (id, data) =>
  api.delete(`${url.API_CATEGORY_GET_PAGING_BY_ID}/${id}`, data);
//posts
export const insertPosts = (data) => api.create(url.API_POST_INSERT, data);
export const updatePosts = (id, data) =>
  api.update(`${url.API_POST_UPDATE}/${id}`, data);
export const getPagingPostsV2 = (data) =>
  api.get(url.API_POST_GET_PAGING_V2, data);
export const deletePosts = (id, data) =>
  api.delete(`${url.API_POST_DELETE}/${id}`, data);
export const getPostById = (id) =>
  api.get(`${url.API_POST_GET_BY_ID}/${id}`);

//Menu
export const insertMenu = (data) => api.create(url.API_MENU_INSERT, data);
export const updateMenu = (id, data) =>
  api.update(`${url.API_MENU_UPDATE}/${id}`, data);
export const getAllMenu = (data) => api.get(url.API_MENU_GET_PAGING, data);
export const deleteMenu = (id, data) =>
  api.delete(`${url.API_MENU_DELETE}/${id}`, data);
export const getMenuById = (id, data) =>
  api.get(`${url.API_MENU_GET_PAGING_BY_ID}/${id}`, data);

//Schemas
export const insertSchemas = (data) => api.create(url.API_SCHEMAS_INSERT, data);
export const updateSchemas = (id, data) =>
  api.update(`${url.API_SCHEMAS_UPDATE}/${id}`, data);
export const getAllSchemas = (data) =>
  api.get(url.API_SCHEMAS_GET_PAGING, data);
export const deleteSchemas = (id, data) =>
  api.delete(`${url.API_SCHEMAS_DELETE}/${id}`, data);
export const getSchemasByPost = (id, data) =>
  api.get(`${url.API_SCHEMAS_GET_PAGING_BY_POST}/${id}`, data);
export const getSchemasByPage = (id, data) =>
  api.get(`${url.API_SCHEMAS_GET_PAGING_BY_PAGE}/${id}`, data);

//ShortCode
export const insertShortCode = (data) =>
  api.create(url.API_SHORTCODE_INSERT, data);
export const updateShortCode = (id, data) =>
  api.update(`${url.API_SHORTCODE_UPDATE}/${id}`, data);
export const getAllShortCode = (data) =>
  api.get(url.API_SHORTCODE_GET_PAGING, data);
export const deleteShortCode = (id, data) =>
  api.delete(`${url.API_SHORTCODE_DELETE}/${id}`, data);
export const getShortCodeById = (id, data) =>
  api.get(`${url.API_SHORTCODE_GET_PAGING_BY_ID}/${id}`, data);

//ShortCode
export const insertBanner = (data) => api.create(url.API_BANNER_INSERT, data);
export const updateBanner = (id, data) =>
  api.update(`${url.API_BANNER_UPDATE}/${id}`, data);
export const getAllBanner = (data) => api.get(url.API_BANNER_GET_PAGING, data);
export const deleteBanner = (id, data) =>
  api.delete(`${url.API_BANNER_DELETE}/${id}`, data);
export const getBannerById = (id, data) =>
  api.get(`${url.API_BANNER_GET_PAGING_BY_ID}/${id}`, data);

//Role
export const insertRole = (data) => api.create(url.API_ROLE_INSERT, data);
export const updateRole = (id, data) =>
  api.update(`${url.API_ROLE_UPDATE}/${id}`, data);
export const deleteRole = (id, data) =>
  api.delete(`${url.API_ROLE_DELETE}/${id}`, data);
export const getAllRole = (data) => api.get(url.API_ROLE_GETALL, data);
export const getPagingRole = (data) => api.get(url.API_ROLE_GET_PAGING, data);
export const getRoleById = (id, data) =>
  api.get(`${url.API_ROLE_GET_PAGING_BY_ID}/${id}`, data);

//Action
export const insertAction = (data) => api.create(url.API_ACTION_INSERT, data);
export const updateAction = (id, data) =>
  api.update(`${url.API_ACTION_UPDATE}/${id}`, data);
export const deleteAction = (id, data) =>
  api.delete(`${url.API_ACTION_DELETE}/${id}`, data);
export const getAllAction = (data) => api.get(url.API_ACTION_GETALL, data);
export const getPagingAction = (data) =>
  api.get(url.API_ACTION_GET_PAGING, data);
export const getActionById = (id, data) =>
  api.get(`${url.API_ACTION_GET_PAGING_BY_ID}/${id}`, data);

//RoleAction
export const insertRoleAction = (data) =>
  api.create(url.API_ROLEACTION_INSERT, data);
export const updateRoleAction = (id, data) =>
  api.update(`${url.API_ROLEACTION_UPDATE}/${id}`, data);
export const insertManyRoleAction = (data) =>
  api.create(url.API_ROLEACTION_INSERTMANY, data);
export const updateManyRoleAction = (id, data) =>
  api.update(`${url.API_ROLEACTION_UPDATEMANY}/${id}`, data);
export const deleteRoleAction = (id, data) =>
  api.delete(`${url.API_ROLEACTION_DELETE}/${id}`, data);
export const getPagingRoleAction = (data) =>
  api.get(url.API_ROLEACTION_GET_PAGING, data);
export const getRoleActionById = (id, data) =>
  api.get(`${url.API_ROLEACTION_GET_PAGING_BY_ID}/${id}`, data);

//User
export const insertUser = (data) => api.create(url.API_USER_INSERT, data);
export const updateUser = (id, data) =>
  api.update(`${url.API_USER_UPDATE}/${id}`, data);
export const deleteUser = (id, data) =>
  api.delete(`${url.API_USER_DELETE}/${id}`, data);
export const getPagingUser = (data) => api.get(url.API_USER_GET_PAGING, data);
export const getUserById = (id, data) =>
  api.get(`${url.API_USER_GET_PAGING_BY_ID}/${id}`, data);
