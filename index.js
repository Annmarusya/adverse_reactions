import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "https://api.fda.gov/drug/event.json";

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  if (!req.query.medicinalproduct || req.query.medicinalproduct.trim() === "") {
    return res.render("index.ejs", { content: "Please enter a medicinal product" });
  }
  const input = req.query.medicinalproduct.trim();
  if (!/[a-zA-Zа-яА-Я]/.test(input)) {
    return res.render("index.ejs", { 
      content: "Please enter a medicinal product name (text), not just numbers" 
    });
  }
  axios.get(API_URL, 
    {params: {
      search: "patient.drug.medicinalproduct:"+input,
      count: "patient.reaction.reactionmeddrapt.exact",
      limit: 10
    }}
  ).then((response) => {
    if (!response.data.results || response.data.results.length === 0) {
      return res.render("index.ejs", { content: "Medicinal product not found. Please check the spelling." });
    }
    res.render("index.ejs", { content: response.data.results.map(item => item.term).join(", ") });
  }).catch((error) => {
    console.error("Error:", error);
    let errorMessage = "Error searching for medicinal product. ";
    if (error.response) {
      // API returned an error
      errorMessage += error.response.data?.error?.message || `Status: ${error.response.status}`;
    } else if (error.request) {
      // Request was sent but no response received
      errorMessage += "Failed to get response from server.";
    } else {
      // Error in request setup
      errorMessage += "Error executing request.";
    }
    res.render("index.ejs", { content: errorMessage });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});