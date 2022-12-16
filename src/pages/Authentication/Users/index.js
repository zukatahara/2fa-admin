import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import {
  message,
  Input,
  Button,
  Form,
  Space,
  Select,
  Tooltip,
  Table,
  Drawer,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  deleteUser,
  getAllRole,
  getPagingUser,
  insertUser,
  updateUser,
} from "../../../helpers/helper";
import moment from "moment";
import BreadCrumb from "../../../common/BreadCrumb";
import UserStatus from "../../../store/status/userStatus";

const { Option } = Select;

const Users = () => {
  document.title = "Management Users";

  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [listUser, setListUser] = useState([]);
  const [listRole, setListRole] = useState([]);
  const [listStatus, setListStatus] = useState([]);
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListUser(dataRes);
      //get role
      const resListRole = await getAllRole();
      setListRole(resListRole);
      setListStatus(UserStatus);
    }
    fetchData();
  }, []);

  const getAllData = async (_prams) => {
    const params = _prams
      ? _prams
      : {
          pageIndex: 1,
          pageSize: 100000,
          search: "",
        };
    const dataRes = await getPagingUser(params);

    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        return {
          key: item._id,
          userName: item.userName,
          fullName: item.fullName,
          email: item.email,
          phoneNumber: item.phoneNumber,
          roleName: item.role?.roleName,
          activeStatus:
            item.activeStatus === 1 ? "Kích hoạt" : "Ngưng kích hoạt",
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return dataRes?.data ? data : [];
  };

  const onFinish = async (data) => {
    const dataReq = {
      userName: data.userName,
      password: data.password,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      activeStatus: data.activeStatus,
      role: data.role,
    };

    if (!data.id) {
      //Save
      const dataRes = await insertUser(dataReq);
      dataRes.status === 1
        ? message.success(`Save Success! ${dataRes.message}`)
        : message.error(`Save Failed! ${dataRes.message}`);
      if (dataRes.status === 1) {
        onClose();
      }
    } else {
      //Update
      const dataRes = await updateUser(data.id, dataReq);
      dataRes.status === 1
        ? message.success(`Update Success! ${dataRes.message}`)
        : message.error(`Update Failed! ${dataRes.message}`);
      if (dataRes.status === 1) {
        onClose();
      }
    }

    form.resetFields();
    formSearch.resetFields();
    handleRefresh();
    const dataRes = await getAllData();
    setListUser(dataRes);
  };

  const handleRefresh = async () => {
    form.resetFields();
  };
  const handleRefreshSearch = async () => {
    formSearch.resetFields();
    const dataRes = await getAllData();
    setListUser(dataRes);
  };

  const handleSearch = async () => {
    const dataForm = formSearch.getFieldsValue();
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.userName ? dataForm.userName : "",
    };

    const dataRes = await getAllData(params);
    setListUser(dataRes);
  };
  const onClose = () => {
    setVisibleForm(false);
  };
  const showDrawer = () => {
    setVisibleForm(true);
  };
  const handleNewUser = () => {
    setDrawerTitle("Add User");
    showDrawer();
    console.log(visibleForm);
    form.resetFields();
  };
  const onEdit = (key) => {
    const dataEdit = listUser.filter((item) => item.key === key);
    const dataRole = listRole.filter(
      (item) => item.roleName === dataEdit[0].roleName
    );
    const dataStatus = listStatus.filter(
      (item) => item.label === dataEdit[0].activeStatus
    );

    form.setFieldsValue({
      id: dataEdit[0].key,
      userName: dataEdit[0].userName,
      fullName: dataEdit[0].fullName,
      phoneNumber: dataEdit[0].phoneNumber,
      email: dataEdit[0].email,
      activeStatus: dataStatus[0].value,
      roleName: dataRole[0].roleName,
      role: dataRole[0]._id,
    });
    setDrawerTitle("Edit User");
    showDrawer();
  };

  const onDelete = async (key) => {
    const dataRes = await deleteUser(key);
    dataRes.status === 1
      ? message.success(`Delete Success! ${dataRes.message}`)
      : message.error(`Delete Failed! ${dataRes.message}`);

    handleRefreshSearch();
  };

  const columns = [
    {
      title: "User Name",
      dataIndex: "userName",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "PhoneNumber",
      dataIndex: "phoneNumber",
    },
    {
      title: "Created Time",
      dataIndex: "createdTime",
    },
    {
      title: "Role",
      dataIndex: "roleName",
    },
    {
      title: "Active Status",
      dataIndex: "activeStatus",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (_, record) =>
        listUser.length >= 1 ? (
          <Space>
            <Tooltip title="Edit">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(record.key)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="danger"
                shape="circle"
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => onDelete(record.key)}
              />
            </Tooltip>
          </Space>
        ) : null,
    },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="User" pageTitle="Management Users" />
          <div>
            <Col>
              <Drawer
                title={drawerTitle}
                placement={"right"}
                width={"30%"}
                onClose={onClose}
                visible={visibleForm}
                bodyStyle={{
                  paddingBottom: 80,
                }}
                style={{ marginTop: "70px" }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  autoComplete="off"
                >
                  <Row>
                    <Col hidden={true}>
                      <Form.Item name="id" label="Id">
                        <Input name="id" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="userName"
                        label="User Name"
                        rules={[
                          {
                            required: true,
                            message: "Please input user name!",
                          },
                          {
                            type: "userName",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter user name"
                          name="userName"
                          allowClear={true}
                        />
                      </Form.Item>

                      <Form.Item
                        name="phoneNumber"
                        label="Phone Number"
                        rules={[
                          {
                            required: true,
                            message: "Please input phone number!",
                          },
                          {
                            type: "phoneNumber",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter post fullName!"
                          name="phoneNumber"
                          allowClear={true}
                        />
                      </Form.Item>

                      <Form.Item
                        name="role"
                        label="Role"
                        rules={[
                          {
                            required: true,
                            message: "Please select role!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a role!"
                          allowClear
                          showSearch
                          name="roles"
                        >
                          {listRole.length > 0 &&
                            listRole.map((item) => {
                              return (
                                <Option key={item._id} value={item._id}>
                                  {item.roleName}
                                </Option>
                              );
                            })}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                          {
                            required: true,
                            message: "Please input password!",
                          },
                          {
                            type: "password",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter post password!"
                          name="password"
                          allowClear={true}
                        />
                      </Form.Item>

                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          {
                            type: "email",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter post email!"
                          name="email"
                          allowClear={true}
                        />
                      </Form.Item>

                      <Form.Item
                        name="fullName"
                        label="Full Name"
                        rules={[
                          {
                            type: "fullName",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter post full name!"
                          name="fullName"
                          allowClear={true}
                        />
                      </Form.Item>

                      <Form.Item
                        name="activeStatus"
                        label="Active Status"
                        rules={[
                          {
                            required: true,
                            message: "Please select active status!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a active status!"
                          allowClear
                          showSearch
                          name="activeStatus"
                        >
                          {listStatus.length > 0 &&
                            listStatus.map((item) => {
                              return (
                                <Option key={item.value} value={item.value}>
                                  {item.label}
                                </Option>
                              );
                            })}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item className="mt-3">
                    <Space>
                      <Button type="primary" htmlType="submit">
                        Save
                      </Button>
                      <Button
                        type="primary"
                        htmlType="button"
                        onClick={() => handleRefresh()}
                      >
                        Refresh
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Drawer>
            </Col>
          </div>
          <Row>
            <Col xs={12}>
              <Form
                form={formSearch}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Row>
                  <Col hidden={true}>
                    <Form.Item name="id" label="Id">
                      <Input name="id" />
                    </Form.Item>
                  </Col>
                  <Col sm={3}>
                    <Form.Item
                      name="userName"
                      label="User Name"
                      rules={[
                        {
                          required: false,
                          message: "Please input user name!",
                        },
                        {
                          type: "userName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter user name"
                        name="userName"
                        allowClear={true}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item className="mt-3">
                  <Space>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleSearch()}
                    >
                      Search
                    </Button>
                    <Button type="primary" onClick={handleNewUser}>
                      Create
                    </Button>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleRefreshSearch()}
                    >
                      Refresh
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <div>
            <Table columns={columns} dataSource={listUser} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Users;
