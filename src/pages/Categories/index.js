import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../common/BreadCrumb";
import {
  Input,
  Button,
  Form,
  message,
  Space,
  Table,
  Tooltip,
  Drawer,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

import {
  insertCategorys,
  getPagingCategorys,
  updateCategorys,
  deleteCategorys,
  insertSchemas,
} from "../../helpers/helper";
import toSlug from "../../common/function";

const getAllData = async (_prams) => {
  const params = _prams
    ? _prams
    : {
        pageIndex: 1,
        pageSize: 1000,
        search: "",
      };
  const dataRes = await getPagingCategorys(params);

  const data =
    dataRes?.data &&
    dataRes?.data.length > 0 &&
    dataRes?.data.map((item, index) => {
      // data.push({
      //   key: item._id,
      //   categoryName: item.categoryName,
      //   categorySlug: item.categorySlug,
      // });

      return {
        key: item._id,
        categoryName: item.categoryName,
        categorySlug: item.categorySlug,
      };
    });
  return dataRes?.data ? data : [];
};

const Categories = () => {
  document.title = "Management categories";

  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [isShow, setIsShow] = useState(false);
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [listCategory, setListCategory] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListCategory(dataRes);
    }
    fetchData();
  }, []);

  const onSearch = (value) => console.log(value);

  const onFinish = async (data) => {
    const dataReq = {
      categoryName: data.categoryName,
      categorySlug: data.categorySlug,
    };
    const dataSchema = {
      name: data.nameSchemas,
      script: data.script,
      page: data.categorySlug,
    };

    if (!data.id) {
      //Save
      const dataRes = await insertCategorys(dataReq);
      dataRes.status === 1
        ? message.success(`Save Success! ${dataRes.message}`)
        : message.error(`Save Failed! ${dataRes.message}`);
      if (dataRes.status === 1) {
        await insertSchemas(dataSchema);
        onClose();
      }
    } else {
      //Update
      const dataRes = await updateCategorys(data.id, dataReq);
      if (dataRes.status === 1) {
        onClose();
      }
      dataRes.status === 1
        ? message.success(`Update Success! ${dataRes.message}`)
        : message.error(`Update Failed! ${dataRes.message}`);
    }

    form.resetFields();
    const dataRes = await getAllData();
    setListCategory(dataRes);
  };

  const onFinishFailed = () => {
    // message.error("Save failed!");
  };
  const handleRefresh = async () => {
    const dataRes = await getAllData();
    setListCategory(dataRes);
    setCategoryName("");
    form.resetFields();
    formSearch.resetFields();
  };

  const handleRefreshCreate = async () => {
    form.resetFields();
  };

  const handleSearch = async () => {
    const dataForm = formSearch.getFieldsValue();
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: categoryName ? categoryName : "",
    };
    const dataRes = await getAllData(params);
    setListCategory(dataRes);
  };

  const onEdit = (key) => {
    const dataEdit = listCategory.filter((item) => item.key === key);
    form.setFieldsValue({
      categoryName: dataEdit[0].categoryName,
      categorySlug: dataEdit[0].categorySlug,
      id: dataEdit[0].key,
    });
    showDrawer();
    setDrawerTitle("Edit Category");
  };
  const handleChangeTitle = (value) => {
    form.setFieldsValue({
      categorySlug: toSlug(value),
    });
  };
  const onClose = () => {
    setVisibleForm(false);
  };
  const showDrawer = () => {
    setVisibleForm(true);
  };
  const handleNewCategory = () => {
    setDrawerTitle("Add Category");
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
  const onDelete = async (key) => {
    const dataRes = await deleteCategorys(key);
    dataRes.status === 1
      ? message.success(`Delete Success! ${dataRes.message}`)
      : message.error(`Delete Failed! ${dataRes.message}`);

    const dataAll = await getAllData();
    setListCategory(dataAll);
  };

  const columns = [
    {
      title: "Catagory Name",
      dataIndex: "categoryName",
    },
    {
      title: "Catagory Slug",
      dataIndex: "categorySlug",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (_, record) =>
        listCategory.length >= 1 ? (
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
          <BreadCrumb title="Category" pageTitle="Management Posts" />
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
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                >
                  <Row>
                    <Col sm={4} hidden={true}>
                      <Form.Item name="id" label="Id">
                        <Input name="id" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="categoryName"
                        label="Category Name"
                        rules={[
                          {
                            required: true,
                            message: "Please input tag name!",
                          },
                          {
                            type: "categoryName",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter category  name"
                          name="categoryName"
                          allowClear={true}
                          onChange={(e) => handleChangeTitle(e.target.value)}
                        />
                      </Form.Item>

                      <Form.Item
                        name="categorySlug"
                        label="Category Slug"
                        rules={[
                          {
                            required: true,
                            message: "Please input tag slug!",
                          },
                          {
                            type: "categoryName",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter tag name"
                          name="categorySlug"
                          allowClear={true}
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
                    </Col>
                  </Row>
                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit">
                        Save
                      </Button>

                      <Button
                        type="primary"
                        htmlType="button"
                        onClick={() => handleRefreshCreate()}
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
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Row>
                  <Col sm={4} hidden={true}>
                    <Form.Item name="id" label="Id">
                      <Input name="id" />
                    </Form.Item>
                  </Col>
                  <Col sm={4}>
                    <Form.Item
                      name="categorySearch"
                      label="Category Name"
                      rules={[
                        {
                          required: false,
                          message: "Please input category name!",
                        },
                        {
                          type: "categoryName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter category name"
                        name="categorySearch"
                        allowClear={true}
                        onChange={(e) => setCategoryName(e.target.value)}
                        value={categoryName}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleSearch()}
                    >
                      Search
                    </Button>
                    <Button type="primary" onClick={handleNewCategory}>
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

          {/* datatable tags */}
          <div>
            <Table
              columns={columns}
              dataSource={listCategory}
              pagination={{ pageSize: 10 }}
            />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Categories;
