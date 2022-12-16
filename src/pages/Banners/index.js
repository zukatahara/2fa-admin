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
  Drawer,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  deleteBanner,
  getAllBanner,
  insertBanner,
  updateBanner,
} from "../../helpers/helper";
import moment from "moment";
import { deleteImageBunny, uploadFileToBunny } from "../../helpers/api_bunny";

const { Option } = Select;
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = (error) => reject(error);
  });
const Banners = () => {
  document.title = "Management Banners";

  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [listBanner, setListBanner] = useState([]);
  const [isShow, setIsShow] = useState(false);
  const [visibleForm, setVisibleForm] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [drawerTitle, setDrawerTitle] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListBanner(dataRes);
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
    const dataRes = await getAllBanner(params);

    const data =
      dataRes?.data &&
      dataRes?.data.length > 0 &&
      dataRes?.data.map((item) => {
        return {
          key: item._id,
          imageUrl: item.imageUrl,
          imageOrder: item.imageOrder,
          link: item.link,
          position: item.position,
          isShow: item.isShow,
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return dataRes?.data ? data : [];
  };

  const onFinish = async (data) => {
    const dataReq = {
      imageOrder: data.imageOrder,
      link: data.link,
      imageUrl: previewTitle,
      position: data.position,
      isShow: isShow,
    };

    if (!data.id) {
      //Save
      const dataRes = await insertBanner(dataReq);
      dataRes.status === 1
        ? message.success(`Save Success! ${dataRes.message}`)
        : message.error(`Save Failed! ${dataRes.message}`);
    } else {
      //Update
      const dataRes = await updateBanner(data.id, dataReq);
      dataRes.status === 1
        ? message.success(`Update Success! ${dataRes.message}`)
        : message.error(`Update Failed! ${dataRes.message}`);
    }
    setFileList([]);
    handleCloseDrawer();
    form.resetFields();
    handleRefresh();
  };

  const handleRefresh = async () => {
    form.resetFields();
    formSearch.resetFields();
    const dataRes = await getAllData();
    setListBanner(dataRes);
    //
    setIsShow(false);
    setPreviewImage("");
    setPreviewTitle("");
  };

  const handleSearch = async () => {
    const dataForm = formSearch.getFieldsValue();
    console.log("dataForm", dataForm);
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.imageOrder ? dataForm.imageOrder : "",
    };
    const dataRes = await getAllData(params);
    setListBanner(dataRes);
  };

  const onEdit = (key) => {
    const dataEdit = listBanner.filter((item) => item.key === key);

    setIsShow(dataEdit[0].isShow);
    form.setFieldsValue({
      id: dataEdit[0].key,
      imageUrl: dataEdit[0].imageUrl,
      imageOrder: dataEdit[0].imageOrder,
      link: dataEdit[0].link,
      position: dataEdit[0].position,
      isShow: dataEdit[0].isShow,
    });
    setFileList([
      {
        url: `https://bongdathethao.b-cdn.net/${dataEdit[0].imageUrl}`,
        name: dataEdit[0].imageUrl,
      },
    ]);
    setPreviewImage(`https://bongdathethao.b-cdn.net/${dataEdit[0].imageUrl}`);
    setPreviewTitle(dataEdit[0].imageUrl);
    setDrawerTitle("Edit Banner");
    showDrawer();
  };

  const onDelete = async (key) => {
    const dataRes = await deleteBanner(key);
    dataRes.status === 1
      ? message.success(`Delete Success! ${dataRes.message}`)
      : message.error(`Delete Failed! ${dataRes.message}`);

    const data = await getAllData();
    setListBanner(data);
  };

  const handleChange = () => {
    setIsShow(!isShow);
  };

  const handleCancel = () => setPreviewVisible(false);
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
    },

    fileList,
  };

  const columns = [
    {
      title: "Image Order",
      dataIndex: "imageOrder",
    },
    {
      title: "Image Url",
      dataIndex: "imageUrl",
    },
    {
      title: "Link",
      dataIndex: "link",
    },
    {
      title: "Position",
      dataIndex: "position",
    },
    {
      title: "Created Time",
      dataIndex: "createdTime",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (_, record) =>
        listBanner.length >= 1 ? (
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
  const handleNewBanner = () => {
    setDrawerTitle("Add Banner");
    showDrawer();
    console.log(visibleForm);
    form.resetFields();
  };
  const handleCloseDrawer = () => {
    setDrawerTitle("");
    setFileList([]);
    setVisibleForm(false);
    console.log(visibleForm);
    form.resetFields();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Banner" pageTitle="Management Banners" />
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
                <Form.Item name="imageOrder" label="Search by image order:">
                  <Input
                    placeholder="Enter number of image order"
                    name="imageOrder"
                    allowClear={true}
                    type="number"
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
                <Button type="primary" onClick={handleNewBanner}>
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
            <Drawer
              title={drawerTitle}
              placement={"right"}
              width={"30%"}
              onClose={handleCloseDrawer}
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
                <Row className="row-banner">
                  <Col hidden={true}>
                    <Form.Item name="id" label="Id">
                      <Input name="id" />
                    </Form.Item>
                  </Col>
                  <Form.Item name="imageOrder" label="Image Order">
                    <Input
                      placeholder="Enter number of image order"
                      name="imageOrder"
                      allowClear={true}
                      type="number"
                    />
                  </Form.Item>
                  <Form.Item
                    name="link"
                    label="Link"
                    rules={[
                      {
                        required: true,
                        message: "Please input link!",
                      },
                      {
                        type: "link",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter link"
                      name="link"
                      allowClear={true}
                    />
                  </Form.Item>
                  <Form.Item
                    name="position"
                    label="Position"
                    rules={[
                      {
                        required: true,
                        message: "Please input position!",
                      },
                      {
                        type: "position",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter position"
                      name="position"
                      allowClear={true}
                    />
                  </Form.Item>
                  <Form.Item name="imageUrl" label="Image Url" className="">
                    <Space align="start">
                      <Upload
                        {...props}
                        listType="picture-card"
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
                      label="isShow"
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
                      onClick={() => form.resetFields()}
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
          <div>
            <Table columns={columns} dataSource={listBanner} />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Banners;
