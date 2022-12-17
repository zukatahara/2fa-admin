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
  Rate,
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
  // deleteMenu,
  deleteFeedback,
  // getAllMenu,
  getAllFeedback,
  // getSchemasByPage,
  insertFeedback,
  // insertSchemas,
  // updateMenu,
  updateFeedback,
  // updateSchemas,
} from "../../helpers/helper";
import moment from "moment";
import { deleteImageBunny, uploadFileToBunny } from "../../helpers/api_bunny";
import { Drawer } from "antd";
// import toSlug from "../../common/function";
const { Option } = Select;
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = (error) => reject(error);
  });
const Feedbacks = () => {
  document.title = "Management Feedbacks";

  const [form] = Form.useForm();
  const [listCat, setListCat] = useState([]);
  const [listMenu, setListMenu] = useState([]);
  const [listFeedback, setListFeedback] = useState([]);

  const [isShow, setIsShow] = useState(true);

  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [visibleForm, setVisibleForm] = useState(false);
  const [content, setContent] = useState("");
  const [drawerTitle, setDrawerTitle] = useState("");

  // -- Load data
  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListFeedback(dataRes);
    }
    fetchData();
  }, []);
  // console.log(`listFeedback`, listFeedback);
  // --

  // const handleChangeImage = ({ fileList: newFileList }) =>
  //   setFileList(newFileList);
  const getAllData = async (_prams) => {
    const params = _prams
      ? _prams
      : {
          pageIndex: 1,
          pageSize: 100000,
          search: "",
        };
    // console.log(params);
    // const dataRes = await getAllMenu(params);
    const dataRes = await getAllFeedback(params);
    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        console.log(item, "saedsa   ");
        return {
          key: item._id,
          feedbackName: item.feedbackName,
          feedbackContent: item.feedbackContent,
          feedbackRate: item.feedbackRate,
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return dataRes?.data ? data : [];
  };

  // console.log('getAllData', getAllData);

  const onFinish = async (data) => {
    console.log(data);
    const dataReq = {
      feedbackName: data.feedbackName,
      feedbackContent: data.feedbackContent,
      feedbackRate: data.feedbackRate,
    };
    // console.log("dataReq: ", dataReq);
    if (!data.id) {
      console.log(`ko co id`);
      //Save
      const dataRes = await insertFeedback(dataReq);
      if (dataRes) {
        message.success(`Save Success! ${dataRes.message}`);
        setVisibleForm(false);
        handleCloseDrawer();
        // await insertSchemas(dataSchema);
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    } else {
      console.log(`co id`, data.id);

      //Update
      // const dataRes = await updateMenu(data.id, dataReq);
      const dataRes = await updateFeedback(data.id, dataReq);

      if (dataRes.status === 1) {
        // await updateSchemas(data.idschema, dataSchema);
        message.success(`Save Success! ${dataRes.message}`);
        handleCloseDrawer();
      } else {
        message.error(`Save Failed! ${dataRes.message}`);
      }
    }
    const dataRes = await getAllData();
    setListFeedback(dataRes);
    form.resetFields();
    // setPreviewImage("");
    // setPreviewTitle("");
  };
  // const handleChangeTitle = (value) => {
  //   form.setFieldsValue({
  //     menuSlug: toSlug(value),
  //   });
  // };
  const handleRefresh = async () => {
    form.resetFields();
    const dataRes = await getAllData();
    setListFeedback(dataRes);
    // setPreviewImage("");
    // setIsShow(true);
  };

  const handleSearch = async () => {
    const dataForm = form.getFieldsValue();
    console.log('dataForm: ', dataForm);

    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.menuNameSearch ? dataForm.menuNameSearch : "",
    };
    const dataRes = await getAllData(params);
    // setListMenu(dataRes);
    setListFeedback(dataRes);
  };

  const onEdit = async (key) => {
    // console.log(key);
    const dataEdit = listFeedback.filter((item) => item.key === key);
    console.log("dataEdit: ", dataEdit);
    form.setFieldsValue({
      id: dataEdit[0]?.key,
      feedbackName: dataEdit[0]?.feedbackName,
      feedbackContent: dataEdit[0]?.feedbackContent,
      feedbackRate: dataEdit[0]?.feedbackRate,
    });
    setDrawerTitle("Edit Menu");
    showDrawer();
  };

  const onDelete = async (key) => {
    console.log(key);
    const dataRes = await deleteFeedback(key);
    dataRes.status === 1
      ? message.success(`Delete Success! ${dataRes.message}`)
      : message.error(`Delete Failed! ${dataRes.message}`);

    handleRefresh();
  };

  const handleChange = () => {
    setIsShow(!isShow);
  };

  // const handleCancel = () => setPreviewVisible(false);

  const handleNewFeedback = () => {
    setContent("");
    setDrawerTitle("Add Feedback");
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
      title: "Name",
      dataIndex: "feedbackName",
    },
    {
      title: "Content",
      dataIndex: "feedbackContent",
    },
    {
      title: "Rate",
      dataIndex: "feedbackRate",
    },
    {
      title: "Created Time",
      dataIndex: "createdTime",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (_, record) =>
        listFeedback.length >= 1 ? (
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
              {/* -- form  */}
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
                  {/* Name */}
                  <Form.Item
                    label="Name"
                    name="feedbackName"
                    rules={[
                      {
                        required: true,
                        message: "Please input your username!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter name!"
                      // name="feedbackName"
                      // allowClear={true}
                      // onChange={(e) => handleChangeTitle(e.target.value)}
                    />
                  </Form.Item>
                  {/* Content */}
                  <Form.Item
                    label="Content"
                    name="feedbackContent"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter Content!" />
                  </Form.Item>
                  {/* Rate */}
                  <Form.Item
                    name="feedbackRate"
                    label="Rate"
                    rules={[
                      {
                        required: true,
                        message: "Please choses rate!",
                      },
                    ]}
                  >
                    {/* <Input
                      placeholder="Enter rate number!"
                      name="feedbackRate"
                      // allowClear={true}
                      type="number"
                    /> */}
                    <Rate />
                  </Form.Item>
                </Row>

                <Form.Item className="mt-3">
                  <Space>
                    {/* Submit */}
                    <Button type="primary" htmlType="submit">
                      Save
                    </Button>
                    {/* Refresh */}
                    <Button
                      type="info"
                      htmlType="button"
                      onClick={() => handleRefresh()}
                    >
                      Refresh
                    </Button>
                    {/* Close */}
                    <Button type="danger" onClick={handleCloseDrawer}>
                      Close
                    </Button>
                  </Space>
                </Form.Item>
              </Form>

              {/* form --  */}
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
                    label="Search feedback by feedback name:"
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
                    <Button type="primary" onClick={handleNewFeedback}>
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
            <Table columns={columns} dataSource={listFeedback} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Feedbacks;
