/* eslint-disable no-debugger */
import React, { useState, useEffect, useRef } from "react";
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
  Select,
  Modal,
  Upload,
  Drawer,
  Tag,
  Image,
  Badge,
} from "antd";
import { Editor } from "@tinymce/tinymce-react";
import {
  UploadOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { uploadFileToBunny, deleteImageBunny } from "../../helpers/api_bunny";
import {
  getAllMenu,
  // getPagingCategorys,
  getPagingTags,
  insertPosts,
  getPagingPostsV2,
  deletePosts,
  updatePosts,
} from "../../helpers/helper";
import PostStatus from "../../store/status/postStatus";
import { Link, useHistory } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;

const user_id = JSON.parse(sessionStorage.getItem("authUser"))
  ? JSON.parse(sessionStorage.getItem("authUser")).user._id
  : null;

const convertHtmlText = (htmlText) => {
  if (htmlText && htmlText.length > 0) {
    let strText =
      new DOMParser().parseFromString(htmlText, "text/html").documentElement
        .textContent || "";
    if (strText && strText.length > 50) {
      strText = strText.slice(0, 50) + "...";
    }
    return strText;
  }
  return "";
};

const getAllPagingPostsV2 = async (_params) => {
  const params = _params ? _params : {};
  const dataRes = await getPagingPostsV2(params);

  const dataListPost =
    dataRes?.data &&
    dataRes?.data.length > 0 &&
    dataRes?.data.map((item) => {
      console.log(item.menu);
      return {
        key: item._id,
        title: item.title,
        slug: item.slug,
        menu: item.menu,
        category: item.category,
        tags: item.tags,
        description: item.description,
        thumb: item.thumb,
        content: item.content,
        status: item.status,
        numberOfReader: item.numberOfReader,
      };
    });
  return dataRes?.data ? dataListPost : [];
};

const Posts = () => {
  document.title = "Management Posts";
  const history = useHistory();
  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const editorContentRef = useRef(null);
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  // const [listCat, setListCat] = useState([]);
  const [listMenu, setListMenu] = useState([]);
  const [listTag, setListTag] = useState([]);
  const [listPost, setListPost] = useState([]);
  const [listStatus, setListStatus] = useState([]);
  const [postName, setPostName] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [visibleForm, setVisibleForm] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const resListMenu = await getAllMenu({ pageSize: 100000 });
      // const resListCat = await getPagingCategorys({ pageSize: 100000 });
      const resListTag = await getPagingTags({ pageSize: 100000 });
      const resListPost = await getAllPagingPostsV2({ pageSize: 100000 });
      setListMenu(resListMenu.data);
      setListPost(resListPost);
      // setListCat(resListCat.data);
      setListTag(resListTag.data);
      setListStatus(PostStatus);
      setContent("");
    };

    fetchData();
  }, []);

  const onFinish = async (data) => {
    let content = "";
    if (editorContentRef.current) {
      content = editorContentRef.current.getContent() || "";
    }
    const dataReq = {
      title: data.title,
      slug: data.slug,
      // description: data.description,
      // thumb: previewTitle,
      content: content,
      menu: data.menu,
      // category: data.category,
      // tags: data.tags,
      user: user_id,
      // numberOfReader: data.numberOfReader,
      status: data.id ? data.status : data.status.value,
    };
    if (!data.id) {
      const dataRes = await insertPosts(dataReq);
      if (dataRes.status === 1) {
        message.success(`Save Success! ${dataRes.message}`);
        onClose();
        const dataAll = await getAllPagingPostsV2();
        setListPost(dataAll);
        handleRefresh();
      } else message.error(`Save Failed! ${dataRes.message}`);
    } else {
      const dataRes = await updatePosts(data.id, dataReq);
      if (dataRes.status === 1) {
        message.success(`Save Success! ${dataRes.message}`);
        onClose();
        const dataAll = await getAllPagingPostsV2();
        setListPost(dataAll);
        handleRefresh();
      } else message.error(`Save Failed! ${dataRes.message}`);
    }
  };

  const onFinishFailed = () => {
    // message.error("Save failed!");
  };

  const handleRefresh = async () => {
    const dataRes = await getAllPagingPostsV2({ pageSize: 10000 });
    setListPost(dataRes);
    formSearch.resetFields();
    setFileList([]);
    setPreviewImage("");
    handleChangeEditor();
  };

  const handleSearch = async () => {
    const dataForm = formSearch.getFieldsValue();
    if (
      dataForm.postName === undefined &&
      dataForm.postSlug === undefined &&
      dataForm.postDescription === undefined
    ) {
      return;
    }
    const params = {
      pageIndex: 1,
      pageSize: 10000,
      title: dataForm.postName ? dataForm.postName : "",
      slug: dataForm.postSlug ? dataForm.postSlug : "",
      description: dataForm.postDescription ? dataForm.postDescription : "",
    };
    const dataRes = await getAllPagingPostsV2(params);
    setListPost(dataRes);
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
      } else {
        message.error("Upload file to Bunny failed!");
        deleteImageBunny(file.name);
        setPreviewImage("");
        setFileList([]);
      }

      // return false;
    },

    fileList,
  };

  const handleCancel = () => setPreviewVisible(false);

  const handleChangeEditor = () => {};

  const handleNewPost = () => {
    setContent("");
    showDrawer();
    form.resetFields();
    setFileList([]);
    setPreviewImage("");
  };

  const showDrawer = () => {
    setVisibleForm(true);
  };

  const onClose = () => {
    setContent("");
    setVisibleForm(false);
  };

  const onEdit = (key) => {
    const dataEdit = listPost.filter((item) => item.key === key);
    form.setFieldsValue({
      title: dataEdit[0].title,
      slug: dataEdit[0].slug,
      description: dataEdit[0].description,
      thumb: dataEdit[0].thumb,
      menu: dataEdit[0].menu._id,
      tags: dataEdit[0].tags.map((item) => {
        return item._id;
      }),
      numberOfReader: dataEdit[0].numberOfReader,
      status: dataEdit[0].status,
      id: dataEdit[0].key,
      // content: convertHtmlText(dataEdit[0].content),
    });
    setContent(dataEdit[0].content);
    setPreviewImage(`https://bongdathethao.b-cdn.net/${dataEdit[0].thumb}`);
    setPreviewTitle(dataEdit[0].thumb);
    showDrawer();
  };

  const onDelete = async (key) => {
    const dataRes = await deletePosts(key);
    dataRes.status === 1
      ? message.success(`Delete Success! ${dataRes.message}`)
      : message.error(`Delete Failed! ${dataRes.message}`);

    const dataAll = await getAllPagingPostsV2();
    setListPost(dataAll);
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Slug",
      dataIndex: "slug",
    },
    // {
    //   title: "Category",
    //   dataIndex: "category",
    //   render: (_, record) => {
    //     return record.category.categoryName;
    //   },
    // },
    {
      title: "Menu",
      dataIndex: "menu",
      render: (_, record) => {
        console.log(`_`,_);
        const listMenuName = _?.map((item, index) => {
                return (
                  <Tag color="default" key={index}>
                    {item.menuName}
                  </Tag>
                );
              });
              return listMenuName;
      },
    },
    // {
    //   title: "Tags",
    //   dataIndex: "tags",
    //   render: (_, record) => {
    //     const listTagName = _?.map((item, index) => {
    //       return (
    //         <Tag color="default" key={index}>
    //           {item.tagName}
    //         </Tag>
    //       );
    //     });
    //     return listTagName;
    //   },
    // },
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   render: (_, record) => {
    //     const strText = record.description;
    //     return strText.slice(0, 50) + "...";
    //   },
    // },
    // {
    //   title: "Thumb",
    //   dataIndex: "thumb",
    //   render: (_, record) => {
    //     return (
    //       <Image width={150} src={`https://bongdathethao.b-cdn.net/${_}`} />
    //     );
    //   },
    // },
    {
      title: "Content",
      dataIndex: "content",
      render: (_, record) => {
        // console.log('record: ', record);
        // console.log(record);
        return convertHtmlText(_);
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, record) => {
        if (_ === 0) return <Badge color="red" text="Ẩn bài" />;
        if (_ === 1) return <Badge color="green" text="Hiện bài" />;
        if (_ === 2) return <Badge color="blue" text="Chờ duyệt" />;
      },
    },
    // {
    //   title: "Numsdasdfasdber of reader",
    //   dataIndex: "numberOfReader",
    // },
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
                onClick={() => history.push(`/post/${record.key}`)}
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
          <BreadCrumb title="Post" pageTitle="Management Posts" />
          <Row>
            <Col xs={12}>
              {/* <Link to={`/post`}>
                <Button
                  type="primary"
                  // onClick={handleNewPost}
                  icon={<PlusOutlined />}
                >
                  New Post
                </Button>
              </Link> */}
              <Drawer
                width={"70%"}
                onClose={onClose}
                visible={visibleForm}
                bodyStyle={{
                  paddingBottom: 80,
                  marginTop: 60,
                }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  // onFinishFailed={onFinishFailed}
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
                        name="title"
                        label="Post Title"
                        rules={[
                          {
                            required: true,
                            message: "Please input post title!",
                          },
                          {
                            type: "title",
                          },
                          {
                            type: "string",
                            min: 10,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter title"
                          name="title"
                          allowClear={true}
                        />
                      </Form.Item>
                    </Col>
                    <Col sm={3}>
                      <Form.Item
                        name="slug"
                        label="Post Slug"
                        rules={[
                          {
                            required: true,
                            message: "Please input post slug!",
                          },
                          {
                            type: "slug",
                          },
                          {
                            type: "string",
                            min: 1,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter post slug!"
                          name="slug"
                          allowClear={true}
                        />
                      </Form.Item>
                    </Col>
                    {/* <Col sm={3}>
                      <Form.Item
                        name="category"
                        label="Post Category"
                        rules={[
                          {
                            required: true,
                            message: "Please select post category!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a post category!"
                          allowClear
                          showSearch
                          name="category"
                          filterOption={(input, option) =>
                            option.children.includes(input)
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children
                              .toLowerCase()
                              .localeCompare(optionB.children.toLowerCase())
                          }
                        >
                          {listCat.length > 0 &&
                            listCat.map((item) => {
                              return (
                                <Option key={item._id} value={item._id}>
                                  {item.categoryName}
                                </Option>
                              );
                            })}
                        </Select>
                      </Form.Item>
                    </Col> */}
                    <Col sm={3}>
                      <Form.Item
                        name="menu"
                        label="Post Menu"
                        rules={[
                          {
                            required: true,
                            message: "Please select post menu!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a post menu!"
                          allowClear
                          showSearch
                          name="menu"
                          filterOption={(input, option) =>
                            option.children.includes(input)
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children
                              .toLowerCase()
                              .localeCompare(optionB.children.toLowerCase())
                          }
                        >
                          {listMenu.length > 0 &&
                            listMenu.map((item) => {
                              return (
                                <Option key={item._id} value={item._id}>
                                  {item.menuName}
                                </Option>
                              );
                            })}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col sm={3}>
                      <Form.Item
                        name="tags"
                        label="Post Tags"
                        rules={[
                          {
                            required: true,
                            message: "Please select post tags!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select post tags!"
                          allowClear
                          mode="multiple"
                          name="tags"
                          filterOption={(input, option) =>
                            option.children.includes(input)
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.children
                              .toLowerCase()
                              .localeCompare(optionB.children.toLowerCase())
                          }
                        >
                          {listTag.length > 0 &&
                            listTag.map((item) => {
                              return (
                                <Option key={item._id} value={item._id}>
                                  {item.tagName}
                                </Option>
                              );
                            })}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col sm={3}>
                      <Form.Item
                        name="thumb"
                        label="Post Thumb"
                        className=""
                        rules={[
                          {
                            required: true,
                            message: "Please select post thumb!",
                          },
                        ]}
                      >
                        <Space align="start">
                          <Upload
                            {...props}
                            // accept="image/png, image/jpeg, image/gif, image/jpg"
                            // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                          >
                            <Button icon={<UploadOutlined />}>
                              Upload Thumbnail
                            </Button>
                          </Upload>
                          {previewImage && (
                            <>
                              <Tooltip title="View image">
                                <Button
                                  icon={<EyeOutlined />}
                                  onClick={() => setPreviewVisible(true)}
                                />
                              </Tooltip>
                              <Modal
                                open={previewVisible}
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
                    </Col>
                    <Col sm={3}>
                      <Form.Item
                        name="description"
                        label="Post Description"
                        rules={[
                          {
                            required: true,
                            message: "Please input post description!",
                          },
                        ]}
                      >
                        <TextArea
                          placeholder="Enter description"
                          name="description"
                          allowClear={true}
                          // showCount
                        />
                      </Form.Item>
                    </Col>

                    <Col sm={3}>
                      <Form.Item name="status" label="Post Status">
                        <Select
                          name="status"
                          placeholder="Select a post status!"
                          allowClear
                          // defaultValue={{ value: "1", label: "Hiện bài" }}
                        >
                          {listStatus.length > 0 &&
                            listStatus.map((item, index) => {
                              return (
                                <Option key={item.value} value={item.value}>
                                  {item.label}
                                </Option>
                              );
                            })}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col sm={3}>
                      <Form.Item
                        name="numberOfReader"
                        label="Post Number Of Reader"
                      >
                        <Input
                          placeholder="Enter number of reader"
                          name="numberOfReader"
                          allowClear={true}
                          type="number"
                          // showCount
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={12}>
                      {/* <Form.Item
                      name="content"
                      label="Post Content"
                      rules={[
                        {
                          required: true,
                          message: "Please input post content!",
                        },
                      ]}
                    > */}
                      <div className="ant-col ant-form-item-label">
                        <label
                          htmlFor="content"
                          className="ant-form-item-required"
                          title="Post Content"
                        >
                          Post Content
                        </label>
                      </div>
                      <Editor
                        apiKey={
                          "w17lpon88s3owkb87t8wnmyrb7dnvziqf3mrghzfk7ft8cpl"
                        }
                        onInit={(evt, editor) => {
                          editorContentRef.current = editor;
                        }}
                        initialValue={content}
                        onEditorChange={handleChangeEditor}
                        // value={formVal?.post_description}
                        init={{
                          height: 400,
                          menubar: false,
                          file_picker_callback: function (cb, value, meta) {
                            var input = document.createElement("input");
                            input.setAttribute("type", "file");
                            input.setAttribute("accept", "image/*");
                            input.onchange = function () {
                              var file = this.files[0];

                              var reader = new FileReader();
                              reader.onload = function () {
                                var id = "blobid1" + new Date().getTime();
                                var blobCache =
                                  editorContentRef.current.editorUpload
                                    .blobCache;
                                var base64 = reader.result.split(",")[1];
                                var blobInfo = blobCache.create(
                                  id,
                                  file,
                                  base64
                                );
                                blobCache.add(blobInfo);

                                /* call the callback and populate the Title field with the file name */
                                cb(blobInfo.blobUri(), { title: file.name });
                              };
                              reader.readAsDataURL(file);
                            };
                            input.click();
                          },
                          paste_data_images: true,
                          image_title: true,
                          automatic_uploads: true,
                          file_picker_types: "image",
                          plugins: [
                            "advlist",
                            "autolink",
                            "lists",
                            "link",
                            "image",
                            "charmap",
                            "preview",
                            "anchor",
                            "searchreplace",
                            "visualblocks",
                            "code",
                            "fullscreen",
                            "insertdatetime",
                            "media",
                            "table",
                            "code",
                            "help",
                            "wordcount",
                            "image",
                          ],
                          toolbar:
                            "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | link image | code",
                          content_style:
                            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        }}
                      />
                      {/* </Form.Item> */}
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
                        onClick={() => handleSearch()}
                      >
                        Search
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
          </Row>
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
                      name="postName"
                      label="Post Name"
                      rules={[
                        {
                          required: false,
                          message: "Please input post name!",
                        },
                        {
                          type: "postName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter post name"
                        name="postName"
                        allowClear={true}
                        onChange={(e) => setPostName(e.target.value)}
                        value={postName}
                      />
                    </Form.Item>
                  </Col>
                  <Col sm={4}>
                    <Form.Item
                      name="postSlug"
                      label="Post Slug"
                      rules={[
                        {
                          required: false,
                          message: "Please input post slug!",
                        },
                        {
                          type: "postSlug",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter post slug"
                        name="postSlug"
                        allowClear={true}
                        onChange={(e) => setPostSlug(e.target.value)}
                        value={postSlug}
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
                    <Link to={`/post`}>
                      <Button type="primary">Create</Button>
                    </Link>

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
          <Row>
            <Col xs={12} className="mt-2">
              <Table
                columns={columns}
                dataSource={listPost}
                // scroll={{ x: 1500, y: 300 }}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Posts;
