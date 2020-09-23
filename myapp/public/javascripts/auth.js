module.exports = {
  isLogined: function (req, res) {
    if (req.user) {
      return true;
    } else {
      return false;
    }
  },
};
