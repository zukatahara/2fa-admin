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
  getAllMenu,
  getSchemasByPage,
  insertMenu,
  insertSchemas,
  updateMenu,
  updateSchemas,
} from "../../helpers/helper";
import moment from "moment";
import { deleteImageBunny, uploadFileToBunny } from "../../helpers/api_bunny";
import { Drawer } from "antd";
import toSlug from "../../common/function";
const { Option } = Select;
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = (error) => reject(error);
  });
const Menus = () => {
  document.title = "Management Menus";

  const [form] = Form.useForm();
  const [listCat, setListCat] = useState([]);
  const [listMenu, setListMenu] = useState([]);
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
      setListMenu(dataRes);
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
    console.log(params);
    const dataRes = await getAllMenu(params);
    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        return {
          key: item._id,
          menuName: item.menuName,
          menuSlug: item.menuSlug,
          menuIcon: item.menuIcon,
          menuOrder: item.menuOrder,
          parent: item.parent,
          isShow: item.isShow,
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return dataRes?.data ? data : [];
  };

  const onFinish = async (data) => {
    const dataReq = {
      menuName: data.menuName,
      menuSlug: data.menuSlug,
      menuIcon: previewTitle,
      menuOrder: data.menuOrder,
      parent: data.parent,
      isShow: isShow,
    };
    const dataSchema = {
      name: data.nameSchemas,
      script: data.script,
      page: data.menuSlug,
    };

    if (!data.id) {
      //Save
      const dataRes = await insertMenu(dataReq);
      if (dataRes.status === 1) {
        message.success(`Save Success! ${dataRes.message}`);
        setVisibleForm(false);
        handleCloseDrawer();
        await insertSchemas(dataSchema);
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    } else {
      //Update

      const dataRes = await updateMenu(data.id, dataReq);
      if (dataRes.status === 1) {
        await updateSchemas(data.idschema, dataSchema);
        message.success(`Save Success! ${dataRes.message}`);
        handleCloseDrawer();
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    }
    const dataRes = await getAllData();
    setListMenu(dataRes);
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
    setListMenu(dataRes);
    setPreviewImage("");
    // setIsShow(true);
  };

  const handleSearch = async () => {
    const dataForm = form.getFieldsValue();
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.menuNameSearch ? dataForm.menuNameSearch : "",
    };
    const dataRes = await getAllData(params);
    setListMenu(dataRes);
  };

  const onEdit = async (key) => {
    const dataEdit = listMenu.filter((item) => item.key === key);

    setIsShow(dataEdit[0].isShow);
    const dataSchema = await getSchemasByPage(dataEdit[0].menuSlug);
    form.setFieldsValue({
      nameSchemas: dataSchema[0]?.name,
      script: dataSchema[0]?.script,
      idschema: dataSchema[0]?._id,
      menuName: dataEdit[0].menuName,
      menuSlug: dataEdit[0].menuSlug,
      menuIcon: dataEdit[0].menuIcon,
      menuOrder: dataEdit[0].menuOrder,
      parent: dataEdit[0].parent,
      id: dataEdit[0].key,
      isShow: dataEdit[0].isShow,
    });

    setPreviewImage(`https://bongdathethao.b-cdn.net/${dataEdit[0].menuIcon}`);
    setPreviewTitle(dataEdit[0].menuIcon);
    setFileList([
      {
        url: `https://bongdathethao.b-cdn.net/${dataEdit[0].menuIcon}`,
        name: dataEdit[0].menuIcon,
      },
    ]);
    setContent("");
    setDrawerTitle("Edit Menu");
    showDrawer();
  };

  const onDelete = async (key) => {
    const dataRes = await deleteMenu(key);
    dataRes.status === 1
      ? message.success(`Delete Success! ${dataRes.message}`)
      : message.error(`Delete Failed! ${dataRes.message}`);

    handleRefresh();
  };

  const handleChange = () => {
    setIsShow(!isShow);
  };

  const handleCancel = () => setPreviewVisible(false);

  const handleNewMenu = () => {
    setContent("");
    setDrawerTitle("Add Menu");
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

  const props = {
    onRemove: async (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      const resDelete = await deleteImageBunny(file.name);
      if (resDelete.HttpCode === 200) {
        message.success("Delete file to Bunny successfully!");
        setPreviewImage("");
      } else {
        message.error("Delete file to Bunny failed!");
      }
    },
    beforeUpload: async (file) => {
      setFileList([file]);
      const resUpload = await uploadFileToBunny(file);
      if (resUpload.HttpCode === 201) {
        message.success("Upload file to Bunny successfully!");
        setPreviewImage("https://bongdathethao.b-cdn.net/" + file.name);
        setPreviewTitle(file.name);
        return false;
      } else {
        message.error("Upload file to Bunny failed!");
        deleteImageBunny(file.name);
        setPreviewImage("");
        setFileList([]);
        return false;
      }

      // return false;
    },

    fileList,
  };

  const columns = [
    {
      title: "Menu Name",
      dataIndex: "menuName",
    },
    {
      title: "Menu Slug",
      dataIndex: "menuSlug",
    },
    {
      title: "Menu Order",
      dataIndex: "menuOrder",
    },
    // {
    //   title: "Menu Parent",
    //   dataIndex: "menuParent",
    // },
    {
      title: "Menu Icon",
      dataIndex: "menuIcon",
    },
    {
      title: "Created Time",
      dataIndex: "createdTime",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (_, record) =>
        listMenu.length >= 1 ? (
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
          <BreadCrumb title="Menu" pageTitle="Management Menus" />

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
                    name="menuName"
                    label="Menu Name"
                    rules={[
                      {
                        required: true,
                        message: "Please input menu  name!",
                      },
                      {
                        type: "menuName",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter name"
                      name="menuName"
                      allowClear={true}
                      onChange={(e) => handleChangeTitle(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="menuSlug"
                    label="Menu Slug"
                    rules={[
                      {
                        required: true,
                        message: "Please input menu slug!",
                      },
                      {
                        type: "menuSlug",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter post slug!"
                      name="menuSlug"
                      allowClear={true}
                    />
                  </Form.Item>

                  <Form.Item name="menuOrder" label="Menu Order">
                    <Input
                      placeholder="Enter number of menu order"
                      name="menuOrder"
                      allowClear={true}
                      type="number"
                    />
                  </Form.Item>

                  <Form.Item name="parent" label="Menu Parent">
                    <Select
                      placeholder="Select a menu parent!"
                      allowClear
                      showSearch
                      name="menus"
                    >
                      {listMenu.length > 0 &&
                        listMenu.map((item) => {
                          return (
                            <Option key={item.key} value={item.key}>
                              {item.menuName}
                            </Option>
                          );
                        })}
                    </Select>
                  </Form.Item>

                 

                  <Form.Item name="menuIcon" label="Menu Icon" className="">
                    <Space align="start">
                      <Upload
                        {...props}
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleChangeImage}
                        onPreview={handlePreview}
                      >
                        <div>
                          <PlusOutlined />
                          <div
                            style={{
                              marginTop: 8,
                            }}
                          >
                            Upload
                          </div>
                        </div>
                      </Upload>
                      {previewImage && (
                        <>
                          <Modal
                            visible={previewVisible}
                            title={previewTitle}
                            footer={null}
                            onCancel={handleCancel}
                          >
                            <img
                              alt={previewTitle}
                              style={{ width: "100%" }}
                              src={previewImage}
                            />
                          </Modal>
                        </>
                      )}
                    </Space>
                  </Form.Item>
                  <Row>
                    <Form.Item
                      name="isShow"
                      label="Is Show"
                      rules={[
                        {
                          required: false,
                          message: "Please menu is Show!",
                        },
                        {
                          type: "isShow",
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
                    <Form.Item
                      name="nameSchemas"
                      label="Name Schemas"
                      rules={[
                        {
                          required: true,
                          message: "Please enter name schemas!",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter name of schemas"
                        name="nameSchemas"
                        allowClear={true}
                      />
                    </Form.Item>
                    <Form.Item name="script" label="Script Schemas">
                      <Input.TextArea
                        placeholder="Enter script of schemas"
                        name="script"
                        allowClear={true}
                        style={{ height: "200px" }}
                      />
                    </Form.Item>
                    <Col hidden={true}>
                      <Form.Item name="idschema" label="Id">
                        <Input name="idschema" />
                      </Form.Item>
                    </Col>
                  </Row>
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
                    name="menuNameSearch"
                    label="Search menu by menu name:"
                    rules={[
                      {
                        required: false,
                        message: "Please input menu  name!",
                      },
                      {
                        type: "menuNameSearch",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter name"
                      name="menuNameSearch"
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
                    <Button type="primary" onClick={handleNewMenu}>
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
            <Table columns={columns} dataSource={listMenu} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Menus;
