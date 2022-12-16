import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../common/BreadCrumb";
import {
  message,
  Input,
  Button,
  Form,
  Space,
  Tooltip,
  Table,
  Drawer,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  deleteShortCode,
  getAllShortCode,
  insertShortCode,
  updateShortCode,
} from "../../helpers/helper";
import moment from "moment";

const ShortCodes = () => {
  document.title = "Management ShortCodes";

  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [listShortCode, setShortCode] = useState([]);
  const [isShow, setIsShow] = useState(false);
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setShortCode(dataRes);
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
    const dataRes = await getAllShortCode(params);

    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        return {
          key: item._id,
          name: item.name,
          content: item.content,
          status: item.status,
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return dataRes?.data ? data : [];
  };

  const onFinish = async (data) => {
    const dataReq = {
      name: data.name,
      content: data.content,
      status: isShow,
    };

    if (!data.id) {
      //Save
      const dataRes = await insertShortCode(dataReq);
      dataRes.status === 1
        ? message.success(`Save Success! ${dataRes.message}`)
        : message.error(`Save Failed! ${dataRes.message}`);
    } else {
      //Update
      const dataRes = await updateShortCode(data.id, dataReq);
      dataRes.status === 1
        ? message.success(`Update Success! ${dataRes.message}`)
        : message.error(`Update Failed! ${dataRes.message}`);
    }
    //
    handleCloseDrawer();
    form.resetFields();
    setIsShow(false);
    //
    const dataRes = await getAllData();
    setShortCode(dataRes);
  };

  const handleSearch = async () => {
    const dataForm = formSearch.getFieldsValue();
    console.log(dataForm.name);
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.name ? dataForm.name : "",
    };
    const dataRes = await getAllData(params);
    setShortCode(dataRes);
  };

  const onEdit = (key) => {
    const dataEdit = listShortCode.filter((item) => item.key === key);
    //
    setIsShow(dataEdit[0].status);
    //
    form.setFieldsValue({
      id: dataEdit[0].key,
      name: dataEdit[0].name,
      content: dataEdit[0].content,
      status: dataEdit[0].status,
    });

    setDrawerTitle("Edit Short code");
    showDrawer();
  };

  const onDelete = async (key) => {
    const dataRes = await deleteShortCode(key);
    dataRes.status === 1
      ? message.success(`Delete Success! ${dataRes.message}`)
      : message.error(`Delete Failed! ${dataRes.message}`);
    //
    handleRefresh();
  };

  const handleRefresh = async () => {
    form.resetFields();
    formSearch.resetFields();
    const dataRes = await getAllData();
    setIsShow(false);
    setShortCode(dataRes);
  };

  const handleChange = () => {
    setIsShow(!isShow);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Content",
      dataIndex: "content",
    },
    {
      title: "Created Time",
      dataIndex: "createdTime",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (_, record) =>
        listShortCode.length >= 1 ? (
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

  const onClose = () => {
    setVisibleForm(false);
  };
  const showDrawer = () => {
    setVisibleForm(true);
  };
  const handleNewShortCode = () => {
    setDrawerTitle("Add Short code");
    showDrawer();
    console.log(visibleForm);
    form.resetFields();
  };
  const handleCloseDrawer = () => {
    setDrawerTitle("");
    setVisibleForm(false);
    console.log(visibleForm);
    form.resetFields();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Short Code" pageTitle="Management Short Codes" />
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
                  name="name"
                  label="Search short code by name:"
                  rules={[
                    {
                      required: false,
                      message: "Please input name!",
                    },
                    {
                      type: "Name",
                    },
                    {
                      type: "string",
                      min: 1,
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter name!"
                    name="Name"
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
                <Button type="primary" onClick={handleNewShortCode}>
                  Create
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
          <div>
            <Col xs={12}>
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
                    <Form.Item
                      name="name"
                      label="Name"
                      rules={[
                        {
                          required: true,
                          message: "Please input name!",
                        },
                        {
                          type: "Name",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter name!"
                        name="Name"
                        allowClear={true}
                      />
                    </Form.Item>
                    <Form.Item
                      name="content"
                      label="Content"
                      rules={[
                        {
                          required: true,
                          message: "Please input content!",
                        },
                        {
                          type: "content",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter content!"
                        name="content"
                        allowClear={true}
                      />
                    </Form.Item>
                    <Form.Item
                      name="status"
                      label="Status"
                      rules={[
                        {
                          required: false,
                          message: "Please status!",
                        },
                        {
                          type: "status",
                        },
                      ]}
                      className="item-checkbox"
                    >
                      <Input
                        type="checkbox"
                        checked={isShow}
                        onChange={handleChange}
                        allowClear={true}
                        style={{ border: "aliceblue" }}
                      />
                    </Form.Item>
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
                      <Button type="danger" onClick={handleCloseDrawer}>
                        Close
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Drawer>
            </Col>
          </div>
          <div>
            <Table columns={columns} dataSource={listShortCode} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ShortCodes;
