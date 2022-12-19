import React, { useEffect, useRef, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../../common/BreadCrumb";
import { Editor } from "@tinymce/tinymce-react";

import {
  UploadOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import PostStatus from "../../../store/status/postStatus";
import {
  deleteImageBunny,
  uploadFileToBunny,
} from "../../../helpers/api_bunny";
import { ArrowLeftOutlined } from "@ant-design/icons";
import queryString from "query-string";
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
  Breadcrumb,
} from "antd";
import {
  getAllMenu,
  // getPagingCategorys,
  getPagingTags,
  insertPosts,
  getPagingPostsV2,
  deletePosts,
  updatePosts,
  getPostById,
  insertSchemas,
  getSchemasByPost,
  updateSchemas,
  insertTags,
} from "../../../helpers/helper";
import { Link, useHistory } from "react-router-dom";
import toSlug from "../../../common/function";
import moment from "moment";
const { Option } = Select;
const { TextArea } = Input;
const user_id = JSON.parse(sessionStorage.getItem("authUser"))
  ? JSON.parse(sessionStorage.getItem("authUser")).user._id
  : null;
const getAllPagingPostsV2 = async (_params) => {
  const params = _params ? _params : {};
  const dataRes = await getPagingPostsV2(params);

  const dataListPost =
    dataRes?.data &&
    dataRes?.data.length > 0 &&
    dataRes?.data.map((item) => {
      // console.log(item);
      return {
        key: item._id,
        title: item.title,
        slug: item.slug,
        menu: item.menu,
        // category: item.category,
        tags: item.tags,
        // tags: [],
        // description: item.description,
        thumb: item.thumb,
        content: item.content,
        status: item.status,
        numberOfReader: item.numberOfReader,
      };
    });
  return dataRes?.data ? dataListPost : [];
};
function isEmpty(obj) {
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = (error) => reject(error);
  });
export default function NewPost(props) {
  const user = JSON.parse(sessionStorage.getItem("authUser"));
  const history = useHistory();
  const [form] = Form.useForm();
  const [cacheSchemas, setCacheSchemas] = useState([]);
  // const [listCat, setListCat] = useState([]);
  const [post, setPost] = useState({});
  const [listStatus, setListStatus] = useState([]);
  const editorContentRef = useRef(null);
  const editorDescriptionRef = useRef(null);
  const [content, setContent] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [listTag, setListTag] = useState([]);
  const [listMenu, setListMenu] = useState([]);
  const [description, setDescription] = useState("");
  const [descriptionData, setDescriptionData] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [listPost, setListPost] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [visibleForm, setVisibleForm] = useState(false);
  const [title, setTitle] = useState("");
  const [tagsName, setTagsName] = useState([]);
  const [menusName, setMenusName] = useState([]);
  const videoSchemas = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `VIDEO: ${title}`,
    description: `${descriptionData}`,
    thumbnailUrl: [`${process.env.REACT_APP_IMAGE}${fileList[0]?.name}`],
    uploadDate: `${moment().format()}`,
    author: {
      "@type": "Organization",
      name: "Bóng đá thể thao",
      logo: {
        "@type": "ImageObject",
        url: "https://bongdathethao.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.b973cdae.png&w=256&q=75",
        width: 350,
        height: 60,
      },
    },
    contentUrl: "",
    interactionCount: "0",
  };
  const postSchemas = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.REACT_APP_URL}/${toSlug(title)}`,
    },
    headline: `${title}`,
    image: {
      "@type": "ImageObject",
      url: `${process.env.REACT_APP_IMAGE}${fileList[0]?.name}`,
      width: 1200,
      height: 650,
    },
    datePublished: `${moment().format()}`,
    dateModified: `${moment().format()}`,
    author: {
      "@type": "Person",
      name: `${user.user.fullName || ""}`,
    },
    articleSection: `[]`,
    publisher: {
      "@type": "Organization",
      name: "Bóng đá thể thao",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.REACT_APP_URL}/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.b973cdae.png&w=256&q=75`,
        width: 600,
        height: 60,
      },
    },
    description: `${descriptionData}`,
  };
  const [script, setScript] = useState(postSchemas);
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
    };

    fetchData();
    form.setFieldsValue({ script: JSON.stringify(script, undefined, 4) });
  }, []);
  useEffect(() => {
    const value = props.match.params;
    // console.log(value);
    const getPost = async () => {
      const post = await getPostById(value.id);
      // console.log(post);
      const schema = await getSchemasByPost(value.id);
      schema.map((item) => (item.script = JSON.parse(item.script)));
      setCacheSchemas(schema);
      setPost(post);
      form.setFieldsValue({
        id: post._id,
        title: post.title,
        slug: post.slug,
        menu: post.menu._id || null,
        // category: post.category._id,
        tags: post.tags.map((item) => item._id),
        thumb: post.thumb,
        status: post.status,
        numberOfReader: post.numberOfReader,
      });
      setFileList([
        {
          url: `https://bongdathethao.b-cdn.net/${post.thumb}`,
          name: post.thumb,
        },
      ]);
      setPreviewImage(`https://bongdathethao.b-cdn.net/${post.thumb}`);
      setPreviewTitle(post.thumb);
      setContent(post.content);
      setDescription(post.description);
      setDescriptionData(post.description);
    };

    if (isEmpty(value) === false) {
      getPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.match.params]);
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
  const handleSaveSchemas = () => {
    const name = form.getFieldValue(["nameSchemas"]);
    if (!name) {
      message.error(`Please enter schemas name!`);
      return;
    }
    cacheSchemas.push({ name, script: form.getFieldValue(["script"]) });
    setCacheSchemas(cacheSchemas);
    message.success(`Save schemas Success!`);
  };
  const handleChangeTags = (value) => {
    // console.log('value: ', value);
    const listTagName = value.map((item) => {
      const index = listTag.findIndex((x) => x._id === item);
      if (index !== -1) {
        return listTag[index].tagName;
      } else {
        return item;
      }
    });
    setTagsName(listTagName);
    script.articleSection = listTagName;
    setScript(script);
    form.setFieldsValue({ script: JSON.stringify(script, undefined, 4) });
    if (cacheSchemas.length !== 0) {
      cacheSchemas.map((item) => {
        if (item?.script?.articleSection) {
          item.script.articleSection = listTagName;
        }
      });
      setCacheSchemas(cacheSchemas);
    }
  };
  //-- handle change menu
  const handleChangeMenus = (value) => {
    // console.log("value: ", typeof value);
    const listMenuName = value.map((item) => {
      const index = listMenu.findIndex((x) => x._id === item);
      if (index !== -1) {
        return listMenu[index].menuName;
      } else {
        return item;
      }
    });
    setMenusName(listMenuName);
    script.articleSection = listMenuName;
    setScript(script);
    form.setFieldsValue({ script: JSON.stringify(script, undefined, 4) });
    if (cacheSchemas.length !== 0) {
      cacheSchemas.map((item) => {
        if (item?.script?.articleSection) {
          item.script.articleSection = listMenuName;
        }
      });
      setCacheSchemas(cacheSchemas);
    }
  };

  //--end

  // console.log(`listMenu`, listMenu);

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    script.image[
      "url"
    ] = `${process.env.REACT_APP_IMAGE}${newFileList[0].name}`;
    setScript(script);
    form.setFieldsValue({ script: JSON.stringify(script, undefined, 4) });
    if (cacheSchemas.length !== 0) {
      cacheSchemas.map((item) => {
        if (item?.script?.image) {
          item.script.image[
            "url"
          ] = `${process.env.REACT_APP_IMAGE}${newFileList[0].name}`;
        } else {
          item.script.thumbnailUrl = [
            `${process.env.REACT_APP_IMAGE}${newFileList[0].name}`,
          ];
        }
      });
      setCacheSchemas(cacheSchemas);
    }
  };
  const onFinish = async (data) => {
    // console.log(data, "datadata");
    const addTags = await data?.tags?.map(async (item) => {
      const index = listTag.findIndex((x) => x._id === item);
      if (index === -1) {
        const dataReq = {
          tagName: item,
          tagSlug: toSlug(item),
        };
        const addTags = await insertTags(dataReq);
        const { _id } = await addTags.data;
        return _id;
      } else {
        return item;
      }
    });
    // console.log("haha");
    let content = "",
      description = "";
    if (editorContentRef.current) {
      content = editorContentRef.current.getContent() || "";
    }
    if (editorDescriptionRef.current) {
      description = editorDescriptionRef.current.getContent() || "";
    }
    console.log(data.menus, "datadata");
    // console.log(data);
    const dataReq = {
      title: data.title,
      slug: data.slug,
      // description: description,
      // thumb: previewTitle,
      content: content,
      menu: data.menus || null,
      // category: data.category,
      // tags: [],
      user: user_id,
      numberOfReader: data.numberOfReader,
      status: data.id ? data.status : data.status,
    };
    console.log("dataReq: ", dataReq.menu);
    if (!data.id) {
      const dataRes = await insertPosts(dataReq);
      if (dataRes.status === 1) {
        if (cacheSchemas.length !== 0) {
          cacheSchemas.map(async (item) => {
            const dataReqSchema = {
              name: item.name,
              script: item.script,
              post: dataRes.data._id,
            };
            await insertSchemas(dataReqSchema);
          });

          message.success(`Save Success! ${dataRes.message}`);
          onClose();
          const dataAll = await getAllPagingPostsV2();
          setListPost(dataAll);
          handleRefresh();
        } else {
          const dataReqSchema = {
            name: form.getFieldValue(["nameSchemas"]),
            script: `${form.getFieldValue(["script"])}`,
            post: dataRes.data._id,
          };
          await insertSchemas(dataReqSchema);
          message.success(`Save Success! ${dataRes.message}`);
          onClose();
          const dataAll = await getAllPagingPostsV2();
          setListPost(dataAll);
          handleRefresh();
        }
      } else message.error(`Save Failed! ${dataRes.message}`);
    } else {
      const dataRes = await updatePosts(data.id, dataReq);
      if (dataRes.status === 1) {
        cacheSchemas.map(async (item) => {
          const dataReqSchema = {
            name: item.name,
            script: JSON.stringify(item.script),
            post: data.id,
          };
          // console.log(dataReqSchema, "dataReqSchema");
          await updateSchemas(item._id, dataReqSchema);
        });
        message.success(`Save Success! ${dataRes.message}`);
        onClose();
        const dataAll = await getAllPagingPostsV2();
        setListPost(dataAll);
        handleRefresh();
      } else message.error(`Save Failed! ${dataRes.message}`);
    }
  };
  const handleChangeTypeSchemas = (value) => {
    if (value === "video") {
      setScript(videoSchemas);
      form.setFieldsValue({
        script: JSON.stringify(videoSchemas, undefined, 4),
      });
    } else {
      const nameTags = [];
      // console.log(tagsName);
      tagsName.map((item) => {
        const index = listTag.findIndex((x) => x.tagName === item);
        nameTags.push(listTag[index].tagName);
      });
      postSchemas.articleSection = nameTags;
      setScript(postSchemas);
      form.setFieldsValue({
        script: JSON.stringify(postSchemas, undefined, 4),
      });
    }
  };
  const onClose = () => {
    setContent("");
    setVisibleForm(false);
  };
  const handleRefresh = async () => {
    form.resetFields();
    setFileList([]);
    setPreviewImage("");
    handleChangeEditor();
    setCacheSchemas([]);
    setContent("");
    setDescription("");
    setDescriptionData("");
    editorContentRef.current.reset();
    editorDescriptionRef.current.reset();
  };
  const propsUpload = {
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
  };
  const handleChangeTitle = (value) => {
    // console.log("value: ", value);
    setTitle(value);
    script.headline = value;
    script.mainEntityOfPage["@id"] = `${process.env.REACT_APP_URL}/${toSlug(
      value
    )}`;
    setScript(script);
    form.setFieldsValue({ script: JSON.stringify(script, undefined, 4) });
    form.setFieldsValue({
      slug: toSlug(value),
    });
    if (cacheSchemas.length !== 0) {
      cacheSchemas.map((item) => {
        if (item?.script?.headline) {
          item.script.headline = value;
          item.script.mainEntityOfPage["@id"] = `${
            process.env.REACT_APP_URL
          }/${toSlug(value)}`;
        } else {
          item.script.name = `VIDEO: ${value}`;
        }
      });
      setCacheSchemas(cacheSchemas);
    }
    // console.log(cacheSchemas);
  };
  const handleCancel = () => setPreviewVisible(false);
  const handleChangeEditor = () => {};
  const handleChangeEditorDescription = (value, editor) => {
    const p = document.createElement("p");
    p.innerHTML = value;
    const content = p.innerText;
    setDescriptionData(content);
    script.description = content;
    form.setFieldsValue({ script: JSON.stringify(script, undefined, 4) });
    if (cacheSchemas.length !== 0) {
      cacheSchemas.map((item) => {
        if (item?.script?.description) {
          item.script.description = content;
        }
      });
      // console.log(cacheSchemas);
      setCacheSchemas(cacheSchemas);
    }
  };
  // console.log(listStatus);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            title="New Posts"
            history={history}
            pageTitle="Management Posts"
          />
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.goBack()}
          />
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
                  initialValue={post.title}
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
                    onChange={(e) => handleChangeTitle(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col sm={3}>
                <Form.Item
                  name="slug"
                  label="Post Slug"
                  rules={[
                    {
                      required: false,
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
                    // onChange={(e) => handleChangeTitle(e.target.value)}
                  />
                </Form.Item>
              </Col>
              {/* <Col sm={3}>
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
                            {item.menuName +
                              (item.parent != null
                                ? " (" + item.parent.menuName + ")"
                                : "")}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col> */}

              {/* Menu choose multi */}
              <Col sm={3}>
                <Form.Item
                  // name="tags"
                  // label="Post Tags"
                  name="menus"
                  label="Post Menus"
                  rules={[
                    {
                      required: false,
                      message: "Please select post menus!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select post menus!"
                    allowClear
                    onChange={handleChangeMenus}
                    mode="tags"
                    name="tags"
                    // filterOption={(input, option) =>
                    //   option.children.includes(input)
                    // }
                    // filterSort={(optionA, optionB) =>
                    //   optionA.children
                    //     .toLowerCase()
                    //     .localeCompare(optionB.children.toLowerCase())
                    // }
                  >
                    {listMenu.length > 0 &&
                      listMenu.map((item) => {
                        // console.log(`item`,item);
                        return (
                          <Option key={item._id} value={item._id}>
                            {item.menuName}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              {/* Post tag */}
              {/* <Col sm={3}>
                <Form.Item
                  name="tags"
                  label="Post Tags"
                  rules={[
                    {
                      required: false,
                      message: "Please select post tags!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select post tags!"
                    allowClear
                    onChange={handleChangeTags}
                    mode="tags"
                    name="tags"
                    // filterOption={(input, option) =>
                    //   option.children.includes(input)
                    // }
                    // filterSort={(optionA, optionB) =>
                    //   optionA.children
                    //     .toLowerCase()
                    //     .localeCompare(optionB.children.toLowerCase())
                    // }
                  >
                    {listTag.length > 0 &&
                      listTag.map((item) => {
                        // console.log('item: ', item);
                        return (
                          <Option key={item._id} value={item._id}>
                            {item.tagName}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col> */}
              
              {/* <Col sm={3}>
                <Form.Item
                  name="thumb"
                  label="Post Thumb"
                  className=""
                  rules={[
                    {
                      required: false,
                      message: "Please select post thumb!",
                    },
                  ]}
                >
                  <Space align="start">
                    <Upload
                      {...propsUpload}
                      listType="picture-card"
                      fileList={fileList}
                      onChange={handleChange}
                      onPreview={handlePreview}
                    >
                      {fileList.length >= 1 ? null : (
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
                      )}
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
              </Col> */}

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
              {/* <Col sm={3}>
                <Form.Item name="numberOfReader" label="Post Number Of Reader">
                  <Input
                    placeholder="Enter number of reader"
                    name="numberOfReader"
                    allowClear={true}
                    type="number"
                    // showCount
                  />
                </Form.Item>
              </Col> */}

              <Col xs={12}>
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
                  apiKey={"inq28en58nysf40wc60roky9ar3xuxdpthtlfhjq20fccana"}
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
                            editorContentRef.current.editorUpload.blobCache;
                          var base64 = reader.result.split(",")[1];
                          var blobInfo = blobCache.create(id, file, base64);
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
              <Col hidden={form.getFieldsValue(["id"]).id !== undefined}>
                <Form.Item
                  name="nameSchemas"
                  label="Name Schemas"
                  rules={[
                    {
                      required: form.getFieldsValue(["id"]).id === undefined,
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
              </Col>
              <Col hidden={form.getFieldsValue(["id"]).id !== undefined}>
                <Form.Item
                  name="typeSchemas"
                  label="Type Schemas"
                  rules={[
                    {
                      required: false,
                    },
                  ]}
                >
                  <Select
                    name="typeSchemas"
                    placeholder="Select a type schemas!"
                    allowClear
                    defaultValue={"post"}
                    onChange={handleChangeTypeSchemas}
                    // defaultValue={{ value: "1", label: "Hiện bài" }}
                  >
                    <Option key={0} value={"post"}>
                      Post Schemas
                    </Option>
                    <Option key={1} value={"video"}>
                      Video Schemas
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col
                xs={24}
                hidden={form.getFieldsValue(["id"]).id !== undefined}
              >
                <Form.Item name="script" label="Script Schemas">
                  <Input.TextArea
                    placeholder="Enter script of schemas"
                    name="script"
                    allowClear={true}
                    style={{ height: "200px" }}
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                hidden={form.getFieldsValue(["id"]).id !== undefined}
              >
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleSaveSchemas()}
                    >
                      Lưu Schemas
                    </Button>
                  </Space>
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
        </Container>
      </div>
    </React.Fragment>
  );
}
