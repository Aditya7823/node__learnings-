const { Schema, model } = require("mongoose");

const employeeSchema = new Schema(
  {
    f_Id: {
      type: String, // Assuming ID is a string
      required: true,
      unique: true,
    },
    f_Image: {
      type: String, // Assuming this will store a URL to the image
      required: false,
    },
    f_Name: {
      type: String,
      required: true,
    },
    f_Email: {
      type: String,
      required: true,
      unique: true,
    },
    f_Mobile: {
      type: String, // Mobile numbers stored as strings
      required: true,
    },
    f_Designation: {
      type: String,
      required: true,
    },
    f_Gender: {
      type: String, // Enum could be used for specific gender values
      required: true,
    },
    f_Course: {
      type: String, // Course associated with the employee
      required: false,
    },
    f_Createdate: {
      type: Date, // Record creation date
      default: Date.now,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const Employee = model("Employee", employeeSchema);

module.exports = Employee;
