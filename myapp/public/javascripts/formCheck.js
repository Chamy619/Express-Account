module.exports = {
  registerCheck: function (req, res) {
    const id = req.body.id;
    const pw1 = req.body.pwd;
    const pw2 = req.body.pwd2;

    var check = true;

    if (id === "") {
      req.flash("error", "Must type your ID!!!");
      check = false;
    } else if (pw1 === "" || pw2 === "") {
      req.flash("error", "Must type your PW!!!");
      check = false;
    } else if (pw1 !== pw2) {
      req.flash("error", "PW must same!!!");
      check = false;
    }

    return check;
  },
};
