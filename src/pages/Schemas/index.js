import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../common/BreadCrumb";
import {
  message,
  Input,
  Button,
  Form,
  Space,
  Select,
  Tooltip,
  Table,
  Upload,
  Modal,
  Tag,
} from "antd";
import "./style.css";
import {
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  deleteMenu,
  deleteSchemas,
  getAllMenu,
  getAllSchemas,
  getPagingCategorys,
  getPagingPostsV2,
  insertMenu,
  insertSchemas,
  updateMenu,
  updateSchemas,
} from "../../helpers/helper";
import moment from "moment";
import { deleteImageBunny, uploadFileToBunny } from "../../helpers/api_bunny";
import { Drawer } from "antd";
import toSlug from "../../common/function";
import { Link } from "react-router-dom";
const { Option } = Select;
const { TextArea } = Input;
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = (error) => reject(error);
  });
const Schemas = () => {
  document.title = "Management Schemas";

  const [form] = Form.useForm();
  const [listCat, setListCat] = useState([]);
  const [listPost, setListPost] = useState([]);
  const [listMenu, setListMenu] = useState([]);
  const [listSchemas, setListSchemas] = useState([]);
  const [isShow, setIsShow] = useState(true);

  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [visibleForm, setVisibleForm] = useState(false);
  const [content, setContent] = useState("");
  const [drawerTitle, setDrawerTitle] = useState("");

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      console.log(dataRes);
      setListSchemas(dataRes);
      const dataMenu = await getAllMenu();
      setListMenu(dataMenu.data);
      const resListCat = await getPagingCategorys({ pageSize: 1000 });
      setListCat(resListCat.data);
      const postList = await getPagingPostsV2({ pageSize: 1000 });
      setListPost(postList.data);
    }
    fetchData();
  }, []);
  const handleChangeImage = ({ fileList: newFileList }) =>
    setFileList(newFileList);
  const getAllData = async (_prams) => {
    const params = _prams
      ? _prams
      : {
          pageIndex: 1,
          pageSize: 100000,
          search: "",
        };
    const dataRes = await getAllSchemas(params);
    console.log(dataRes);
    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        return {
          key: item._id,
          name: item.name,
          script: item.script,
          description: item.description,
          post: item.post,
          page: item.page,
          status: item.status,
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return dataRes?.data ? data : [];
  };

  const onFinish = async (data) => {
    const dataReq = {
      name: data.name,
      script: data.script,
      description: data.description,
      post: data.post,
      page: data.page,
    };
    if (!data.id) {
      //Save
      const dataRes = await insertSchemas(dataReq);
      if (dataRes.status === 1) {
        message.success(`Save Success! ${dataRes.message}`);
        setVisibleForm(false);
        handleCloseDrawer();
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    } else {
      //Update
      const dataRes = await updateSchemas(data.id, dataReq);
      if (dataRes.status === 1) {
        message.success(`Save Success! ${dataRes.message}`);
        handleCloseDrawer();
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    }
    const dataRes = await getAllData();
    setListSchemas(dataRes);
    form.resetFields();
    setPreviewImage("");
    setPreviewTitle("");
  };
  const handleChangeTitle = (value) => {
    form.setFieldsValue({
      menuSlug: toSlug(value),
    });
  };
  const handleRefresh = async () => {
    form.resetFields();
    const dataRes = await getAllData();
    setListSchemas(dataRes);
    setPreviewImage("");
    // setIsShow(true);
  };

  const handleSearch = async () => {
    const dataForm = form.getFieldsValue();
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.nameSchemas ? dataForm.nameSchemas : "",
    };

    const dataRes = await getAllData(params);
    console.log(dataRes);
    setListSchemas(dataRes);
  };

  const onEdit = (key) => {
    const dataEdit = listSchemas.filter((item) => item.key === key);

    setIsShow(dataEdit[0].isShow);
    console.log("dataEdit[0]", dataEdit[0]);
    form.setFieldsValue({
      name: dataEdit[0].name,
      script: dataEdit[0].script,
      description: dataEdit[0].description,
      post: dataEdit[0].post,
      page: dataEdit[0].page,
      id: dataEdit[0].key,
      status: dataEdit[0].status,
    });

    setContent("");
    setDrawerTitle("Edit Schemas");
    showDrawer();
  };

  const onDelete = async (key) => {
    const dataRes = await deleteSchemas(key);
    dataRes.status === 1
      ? message.success(`Delete Success! ${dataRes.message}`)
      : message.error(`Delete Failed! ${dataRes.message}`);

    handleRefresh();
  };

  const handleChange = () => {
    setIsShow(!isShow);
  };

  const handleCancel = () => setPreviewVisible(false);

  const handleNewSchemas = () => {
    setContent("");
    setDrawerTitle("Add Schemas");
    showDrawer();
    console.log(visibleForm);
    form.resetFields();
    setFileList([]);
    setPreviewImage("");
  };
  const onClose = () => {
    setContent("");
    setVisibleForm(false);
  };

  const columns = [
    {
      title: "Schemas Name",
      dataIndex: "name",
    },
    // {
    //   title: "Script",
    //   dataIndex: "script",
    // },
    // {
    //   title: "Description",
    //   dataIndex: "description",
    // },

    {
      title: "Post",
      dataIndex: "post",
      render: (_, record) => {
        return (
          <Tag color="default" key={_ && _._id}>
            {_ && _.title}
          </Tag>
        );
      },
    },

    {
      title: "Page Slug",
      dataIndex: "page",
      render: (_, record) => {
        const listTagName = _?.map((item, index) => {
          return (
            <Tag color="default" key={index}>
              {item}
            </Tag>
          );
        });
        return listTagName;
      },
    },
    {
      title: "Created Time",
      dataIndex: "createdTime",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (_, record) =>
        listSchemas.length >= 1 ? (
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

  const showDrawer = () => {
    setVisibleForm(true);
  };
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };
  const handleCloseDrawer = () => {
    setContent("");
    setVisibleForm(false);
    console.log(visibleForm);
    form.resetFields();
    setFileList([]);
    setPreviewImage("");
  };
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Schemas" pageTitle="Management Schemas" />

          <div>
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
                    label="Schemas Name"
                    rules={[
                      {
                        required: true,
                        message: "Please input menu  name!",
                      },
                      {
                        type: "name",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter name"
                      name="name"
                      allowClear={true}
                      onChange={(e) => handleChangeTitle(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="script"
                    label="Script"
                    rules={[
                      {
                        required: true,
                        message: "Please input schemas script!",
                      },
                      {
                        type: "script",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <TextArea
                      style={{ minHeight: "200px" }}
                      placeholder="Enter script!"
                      name="script"
                      allowClear={true}
                    />
                  </Form.Item>

                  <Form.Item name="post" label="Schemas Post">
                    <Select
                      placeholder="Select a post!"
                      allowClear
                      showSearch
                      name="post"
                      size="large"
                    >
                      {listPost.length > 0 &&
                        listPost.map((item) => {
                          return (
                            <Option key={item.key} value={item._id}>
                              {item.title}
                            </Option>
                          );
                        })}
                    </Select>
                  </Form.Item>

                  {/* <Form.Item
                    name="page"
                    label="Schemas category"
                    rules={[
                      {
                        required: false,
                        message: "Please select category!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select a category!"
                      allowClear
                      showSearch
                      name="page"
                      style={{ width: "100%", height: "200px !important" }}
                    >
                      {listCat.length > 0 &&
                        listCat.map((item) => {
                          return (
                            <Option key={item._id} value={item.categorySlug}>
                              {item.categoryName}
                            </Option>
                          );
                        })}
                    </Select>
                  </Form.Item> */}
                  <Form.Item
                    name="page"
                    label="Schemas menu"
                    rules={[
                      {
                        required: false,
                        message: "Please select menu!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select a menu!"
                      allowClear
                      showSearch
                      name="page"
                      mode="multiple"
                      style={{ width: "100%", height: "200px !important" }}
                    >
                      {listMenu.length > 0 &&
                        listMenu.map((item) => {
                          console.log(item);
                          return (
                            <Option key={item._id} value={item.menuSlug}>
                              {item.menuName}
                            </Option>
                          );
                        })}
                      <Option key={0} value={"home"}>
                        Home Page
                      </Option>
                    </Select>
                  </Form.Item>
                </Row>
                <Form.Item className="mt-3">
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Save
                    </Button>
                    <Button
                      type="info"
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
          </div>
          <Row>
            <Col xs={12}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Col hidden={true}>
                  <Form.Item name="id" label="Id">
                    <Input name="id" />
                  </Form.Item>
                </Col>
                <Col sm={3}>
                  <Form.Item
                    name="nameSchemas"
                    label="Search schemas by schemas name:"
                    rules={[
                      {
                        required: false,
                        message: "Please input schemas  name!",
                      },
                      {
                        type: "nameSchemas",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter name"
                      name="nameSchemas"
                      allowClear={true}
                    />
                  </Form.Item>
                </Col>
                <Form.Item className="mt-3">
                  <Space>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleSearch()}
                    >
                      Search
                    </Button>
                    <Button type="primary" onClick={handleNewSchemas}>
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
            </Col>
          </Row>

          <div>
            <Table columns={columns} dataSource={listSchemas} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Schemas;
