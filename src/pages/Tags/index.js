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
  insertTags,
  getPagingTags,
  updateTags,
  deleteTags,
} from "../../helpers/helper";
import toSlug from "../../common/function";

const getAllData = async (_prams) => {
  const params = _prams
    ? _prams
    : {
        pageIndex: 1,
        pageSize: 10,
        search: "",
      };
  const dataRes = await getPagingTags(params);

  const data =
    dataRes?.data &&
    dataRes?.data.length > 0 &&
    dataRes?.data.map((item) => {
      // data.push({
      //   key: item._id,
      //   tagName: item.tagName,
      //   tagSlug: item.tagSlug,
      // });
      return {
        key: item._id,
        tagName: item.tagName,
        tagSlug: item.tagSlug,
      };
    });
  return dataRes?.data ? data : [];
};

const Tags = () => {
  document.title = "Management Tags";

  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [tagName, setTagName] = useState("");
  const [listTag, setListTag] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListTag(dataRes);
    }
    fetchData();
  }, []);

  const handleRefreshCreate = async () => {
    form.resetFields();
  };
  const handleRefreshSearch = async () => {
    const dataRes = await getAllData();
    setListTag(dataRes);
    formSearch.resetFields();
  };
  const onFinish = async (data) => {
    const dataReq = {
      tagName: data.tagName,
      tagSlug: data.tagSlug,
    };

    if (!data.id) {
      //Save
      const dataRes = await insertTags(dataReq);
      dataRes.status === 1
        ? message.success(`Save Success! ${dataRes.message}`)
        : message.error(`Save Failed! ${dataRes.message}`);
      if (dataRes.status === 1) {
        onClose();
      }
    } else {
      //Update
      const dataRes = await updateTags(data.id, dataReq);
      dataRes.status === 1
        ? message.success(`Update Success! ${dataRes.message}`)
        : message.error(`Update Failed! ${dataRes.message}`);
      if (dataRes.status === 1) {
        onClose();
      }
    }

    form.resetFields();
    const dataRes = await getAllData();
    setListTag(dataRes);
  };
  const handleChangeTitle = (value) => {
    form.setFieldsValue({
      tagSlug: toSlug(value),
    });
  };
  const onFinishFailed = () => {
    // message.error("Save failed!");
  };

  const handleRefresh = async () => {
    form.resetFields();
    const dataRes = await getAllData();
    setListTag(dataRes);
  };

  const handleSearch = async () => {
    const dataForm = formSearch.getFieldsValue();
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.tagNameSearch ? dataForm.tagNameSearch : "",
    };
    const dataRes = await getAllData(params);
    setListTag(dataRes);
  };

  const onEdit = (key) => {
    const dataEdit = listTag.filter((item) => item.key === key);
    form.setFieldsValue({
      tagName: dataEdit[0].tagName,
      tagSlug: dataEdit[0].tagSlug,
      id: dataEdit[0].key,
    });
    showDrawer();
    setDrawerTitle("Edit Tag");
  };
  const onClose = () => {
    setVisibleForm(false);
  };
  const showDrawer = () => {
    setVisibleForm(true);
  };
  const handleNewTag = () => {
    setDrawerTitle("Add Tag");
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
    const dataRes = await deleteTags(key);
    dataRes.status === 1
      ? message.success(`Delete Success! ${dataRes.message}`)
      : message.error(`Delete Failed! ${dataRes.message}`);

    handleRefresh();
  };

  const columns = [
    {
      title: "Tag Name",
      dataIndex: "tagName",
    },
    {
      title: "Tag Slug",
      dataIndex: "tagSlug",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (_, record) =>
        listTag.length >= 1 ? (
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
          <BreadCrumb title="Tag" pageTitle="Management Posts" />
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
                        name="tagName"
                        label="Tag Name"
                        rules={[
                          {
                            required: true,
                            message: "Please input tag name!",
                          },
                          {
                            type: "tagName",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter tag name"
                          name="tagName"
                          allowClear={true}
                          onChange={(e) => handleChangeTitle(e.target.value)}
                        />
                      </Form.Item>

                      <Form.Item
                        name="tagSlug"
                        label="Tag Slug"
                        rules={[
                          {
                            required: true,
                            message: "Please input tag slug!",
                          },
                          {
                            type: "tagSlug",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter tag slug"
                          name="tagSlug"
                          allowClear={true}
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
                      name="tagNameSearch"
                      label="Tag Name"
                      rules={[
                        {
                          required: false,
                          message: "Please input tag name!",
                        },
                        {
                          type: "tagNameSearch",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter tag name"
                        name="tagNameSearch"
                        allowClear={true}
                        value={tagName}
                        onChange={(e) => setTagName(e.target.value)}
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
                    <Button type="primary" onClick={handleNewTag}>
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

          {/* datatable tags */}
          <div>
            <Table
              columns={columns}
              dataSource={listTag}
              pagination={{ pageSize: 10 }}
            />
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Tags;
