import { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import LoaderSmall from "../../../Loader/LoaderSmall";
import Message from "../../../Message/Message";
import styles from "./Profilesection.module.css";

const tinyApiKey = process.env.REACT_APP_TINY_API_KEY;
const CLOUD_NAME = "dqonckbjd";
const UNSIGNED_UPLOAD_PRESET = "i2zkhjzh"; // Replace with your Cloudinary preset.

const WritePostSection = ({ postCategory, logout }) => {
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    category: "",
    imageSource: "",
    tag: "",
    status: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UNSIGNED_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, image: data.secure_url }));
        setMessage({ text: "Image uploaded successfully!", type: "success" });
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const content = editorRef.current?.getContent() || "";
    if (!content.trim()) {
      setMessage({ text: "Content cannot be empty!", type: "error" });
      return;
    }

    const { title, desc, category, tag, status, image, imageSource } = formData;

    if (!title || !desc || !category || !tag || !status || !image) {
      setMessage({ text: "All fields are required!", type: "error" });
      return;
    }

    setLoading(true);

    const apiUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:3030";
    const token = localStorage.getItem("authToken");

    const postPayload = {
      title,
      desc,
      category,
      content,
      image,
      imageSource,
      tag,
      status,
    };

    try {
      const response = await fetch(`${apiUrl}/post/addpost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postPayload),
      });
      const result = await response.json();

      if (result?.data === "invalid token") {
        logout("session");
      } else if (result?.error === "yes") {
        throw new Error("Server error occurred");
      } else {
        setMessage({ text: "Post created successfully!", type: "success" });
        setFormData({
          title: "",
          desc: "",
          category: "",
          imageSource: "",
          tag: "",
          status: "",
          image: "",
        });
      }
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["profile-main"]}>
      {loading && (
        <div className={styles["small-loader"]}>
          <LoaderSmall />
        </div>
      )}
      {message.text && (
        <Message
          type={message.type}
          message={message.text}
          cross={() => setMessage({ text: "", type: "" })}
        />
      )}

      <h3>Write New Blog</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles["profile-sub"]}>
          <div className={styles["section"]}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          <div className={styles["section"]}>
            <label htmlFor="desc">Short Description</label>
            <input
              type="text"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
            />
          </div>
          <div className={styles["section"]}>
            <label htmlFor="content">Content</label>
            <Editor
              apiKey={tinyApiKey}
              onInit={(evt, editor) => (editorRef.current = editor)}
              initialValue=""
              init={{
                height: 500,
                menubar: true,
                plugins: "link image lists code",
                toolbar:
                  "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent",
              }}
            />
          </div>
          <div className={styles["section"]}>
            <label htmlFor="category">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {postCategory.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles["section"]}>
            <label htmlFor="image">Image</label>
            <input
              type="file"
              onChange={(e) => handleImageUpload(e.target.files[0])}
            />
          </div>
          <div className={styles["section"]}>
            <label htmlFor="imgSource">Image Source</label>
            <input
              type="text"
              name="imageSource"
              value={formData.imageSource}
              onChange={handleChange}
            />
          </div>
          <div className={styles["section"]}>
            <label htmlFor="tag">Tag</label>
            <input
              type="text"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
            />
          </div>
          <div className={styles["section"]}>
            <label htmlFor="status">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="">Select Status</option>
              <option value="publish">Publish</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <div className={styles["button"]}>
          <button type="submit" disabled={loading}>
            {loading ? "Posting..." : "Post Blog"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WritePostSection;
