import React, { useState, useEffect } from 'react';
import { Card, CardContent, TextField, Button, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import axios from 'axios';
import { formatDistanceToNow } from "date-fns";

const apiUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:3030";

const CommentSection = () => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  // Fetch existing comments when the component mounts
  
  axios.defaults.baseURL = apiUrl;


  useEffect(() => {
    const fetchComments = async () => {
        const queryString = window.location.search;
        const params = new URLSearchParams(queryString);
        const id = params.get("id");
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`/comment/getComment/${id}`,{
          headers: {
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}`,
          }
        });
        console.log(response.data);
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [commentText]);

  // Handle the change in the comment text field
  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
  };

  // Add a new comment using API
  const handleAddComment = async () => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const id = params.get("id");
    if (commentText.trim()) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.post('/comment/addComment', {
            postId: id,
            text: commentText,
        },{
          headers: {
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}`,
          }
        });
        // Append the new comment to the list without refetching
        setComments([...comments, response.data.comment]);
        setCommentText(''); // Clear the input field
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  return (
    <Card sx={{ maxWidth: "100%", padding: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <List>
          {comments.map((comment, index) => (
            <React.Fragment key={comment._id || index}>
              <ListItem>
                <ListItemText
                  primary={comment.text}
                  secondary={
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'gray' }}>
                      <span style={{ marginRight: 8 }}>Posted by: {comment.name}</span>
                      <span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                    </div>
                  }            />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
        <TextField
          label="Add a comment"
          fullWidth
          value={commentText}
          onChange={handleCommentChange}
          multiline
          rows={1}
          sx={{ marginTop: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 1 }}
          onClick={handleAddComment}
        >
          Post Comment
        </Button>
      </CardContent>
    </Card>
  );
};

export default CommentSection;
