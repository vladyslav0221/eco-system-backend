const validator = require("validator");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
const mysql = require("../models/mysqlConnect");
const fs = require("fs");
const Inbox = require("../models/Inbox");
const { isEmpty, getCurrentFormatedDate } = require("../utils");

exports.changestatus = (req, res) => {
  console.log("order_changestatus:", req.body);
  let { id, status } = req.body;
  let updateData = { status: status };
  let updateQuery = mysql.updateQuery("tbl_orders", { id: id }, updateData);
  let selectQuery = `SELECT o.*, u.email, u.firstname, u.lastname FROM tbl_orders as o INNER JOIN tbl_users as u ON o.user_id = u.id  WHERE o.deleted_at is NULL;`;

  mysql
    .query(`${updateQuery}${selectQuery}`)
    .then((result) => {
      return res.json({
        status: 0,
        message: "Successfully updated",
        result,
      });
    })
    .catch((err) => {
      return res.json({
        status: 1,
        message: "Please try again later",
      });
    });
};

exports.orderlist = (req, res) => {
  let selectQuery = `SELECT o.*, u.email, u.firstname, u.lastname FROM tbl_orders as o INNER JOIN tbl_users as u ON o.user_id = u.id  WHERE o.deleted_at is NULL;`;
  console.log("order_select_query:", selectQuery);
  mysql
    .query(selectQuery)
    .then((result) => {
      res.json({
        status: 0,
        list: result,
      });
    })
    .catch((error) => {
      res.json({
        status: 1,
        error,
      });
    });
};

exports.orderdetaillist = (req, res) => {
  let { id } = req.body;
  console.log("=====orderdetaillist:", id);
  let selectQuery = `
    SELECT d.*,u.email, u.firstname, u.lastname, o.shipping, o.option, p.image, c.name as cat_name, p.name as product_name, p.description, p.details, p.ratings, p.bnpl 
    FROM tbl_orderdetails as d LEFT JOIN tbl_categories as c ON d.cat_id=c.id
    INNER JOIN tbl_orders as o ON d.order_id=o.id
    INNER JOIN tbl_users as u ON d.user_id=u.id
    LEFT JOIN tbl_products as p on d.product_id=p.id WHERE o.deleted_at is NULL and d.order_id=${id};`;
  console.log("order_select_query:", selectQuery);
  mysql.query(selectQuery)
    .then((result) => {
      res.json({
        status: 0,
        list: result,
      });
    })
    .catch((error) => {
      res.json({
        status: 1,
        error,
      });
    });
};

exports.register = (req, res) => {
  console.log("inboxregister", req.body);

  let { cat_name, content, segment_id } = req.body;
  let userInfo = req.body.userInfo;
  let items = req.body.items;

  items.forEach((element) => {
    console.log("registernofication", req.body);
  });
  title = title.replace(`'`, `\\'`);
  content = content.replace(`'`, `\\'`);
  const newInbox = {
    title: title,
    content: content,
    segment_id,
  };

  console.log("insertQueyry:", insertQueyry);
  newInbox.created_at = getCurrentFormatedDate();
  let selectQuery = `SELECT * FROM tbl_order WHERE deleted_at is NULL;`;
  let insertQueyry = mysql.getInsertQuery("tbl_order", newInbox);
  mysql
    .query(`${insertQueyry}${selectQuery}${insertQueyry}`)
    .then((result) => {
      return res.json({
        status: 0,
        result,
        message: "Successfully Sended",
      });
    })
    .catch((err) => {
      console.log(err);
      return res.json({
        status: 1,
        message: "Please try again later",
      });
    });
};

exports.delete = (req, res) => {
  console.log("deletebody", req.body);
  let { id, from_email } = req.body;
  let delete_at = getCurrentFormatedDate();
  let updateQuery = mysql.updateQuery(
    "tbl_orders",
    { id: id },
    { deleted_at: delete_at }
  );
  let selectQuery = `SELECT o.*, u.email, u.firstname, u.lastname FROM tbl_orders as o INNER JOIN tbl_users as u ON o.user_id = u.id  WHERE o.deleted_at is NULL;`;

  console.log(updateQuery);
  mysql
    .query(`${updateQuery}${selectQuery}`)
    .then((result) => {
      console.log(result);
      return res.json({
        status: 0,
        message: "Successfully deleted",
        result,
      });
    })
    .catch((err) => {
      return res.json({
        status: 1,
        message: "Please try again later",
      });
    });
};

exports.makeread = (req, res) => {
  console.log("makeread", req.body);
  let { id, from_email } = req.body;
  let delete_at = getCurrentFormatedDate();
  let updateQuery = mysql.updateQuery("tbl_order", { id: id }, { is_read: 1 });
  let selectQuery = `SELECT * FROM tbl_order WHERE deleted_at is NULL;`;

  console.log(updateQuery);
  mysql
    .query(`${updateQuery}${selectQuery}`)
    .then((result) => {
      console.log(result);
      return res.json({
        status: 0,
        message: "Successfully updated",
        result,
      });
    })
    .catch((err) => {
      return res.json({
        status: 1,
        message: "Please try again later",
      });
    });
};
