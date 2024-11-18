import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom"; // For redirecting
import axios from "axios";

const apiUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:3030";


const LikeButton = ({ postId }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const navigate = useNavigate(); // For navigation to login page

  // axios.defaults.withCredentials = true;
  axios.defaults.baseURL = apiUrl;


  

  // Fetch initial likes count and user like status
  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    let title = params.get("title");
    let id = params.get("id");
    const token = localStorage.getItem("authToken");
    const url = apiUrl + "/public/getsinglepost";
    if (title && id) {
      fetch(url, {
        method: "post",
        body: JSON.stringify({
          title: title,
          postId: id,
          timeZone: userTimezone,
        }),
        headers: {
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("no post available");
          }
          return response.json();
        })
        .then((data) => {
          if (data) {
            setLikesCount(data.post.post.likes.length);
          }
        })
        .catch((err) => {
          console.log(err);
          setLiked(false);
        });
    }
  }, []);

  const toggleLike = async () => {
    // Retrieve the token from cookies
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const id = params.get("id");
    const isLogin = localStorage.getItem("isLogin");

    console.log(isLogin);

    if (isLogin) {
      try {
       

        if (liked) {
          // Unlike post request
          setLiked(false);
          const token = localStorage.getItem("authToken");
          const response = await axios.put(`/like/unlike`,{
            postId: id
          },{
            headers: {
              "Content-Type": "application/json", 
              Authorization: `Bearer ${token}`,
            }
          });
         console.log(response);
          setLikesCount(response.data.likes);
        } else {
          // Like post request
          setLiked(true);
          const token = localStorage.getItem("authToken");

          const response = await axios.put(`/like/like`,{
            postId: id
          },{
            headers: {
              "Content-Type": "application/json", 
              Authorization: `Bearer ${token}`,
            }
          });
          console.log(response);
          setLikesCount(response.data.likes);
        }
        setLiked(!liked);
      } catch (error) {
        console.error("Error updating like status", error);
      }
    } else {
      // If token is not found, redirect to login page
      navigate("/login");
    }
  };

  return (
    <div>
      <IconButton onClick={toggleLike} color={liked ? "primary" : "default"}>
        <FavoriteIcon />
      </IconButton>
      <span>{likesCount}</span>
    </div>
  );
};

export default LikeButton;
