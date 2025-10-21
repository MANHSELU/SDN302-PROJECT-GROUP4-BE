const User = require('../../model/User');
const UserBook = require('../../model/User_book');
const UserTable = require('../../model/User_table');
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  const response = {};
  if (!email || !password) {
    Object.assign(response, {
      state: 404,
      message: "Email hoặc mật khẩu không được bỏ trống",
    });
  } else {
    try {
      const users = await user.findOne({ email });

      // Không tìm thấy user
      if (!users) {
        Object.assign(response, {
          state: 404,
          message: "Email không tồn tại",
        });
      }
      // Check role_id nếu đây là login admin
      else if (users.role_id !== "68204adb9bd5898e0b648bd4") {
        Object.assign(response, {
          state: 403,
          message: "Bạn không có quyền truy cập trang Admin",
        });
      }
      // Check mật khẩu
      else {
        const result = bcrypt.compareSync(password, users.password);
        if (!result) {
          Object.assign(response, {
            state: 400,
            message: "Sai mật khẩu",
          });
        } else {
          const accesstoken = jwt.sign(
            { userId: users.id, roleId: users.role_id },
            process.env.JWT_SECRET,
            {
              expiresIn: process.env.JWT_EXPRIRE,
            }
          );
          const refresh_token = jwt.sign(
            { random: new Date().getTime + Math.random() },
            process.env.JWT_SECRET,
            {
              expiresIn: process.env.JWT_REFRESH_JWT_EXPRIRE,
            }
          );
          await user.updateOne(
            { _id: users },
            {
              refresh_token: refresh_token,
            }
          );
          Object.assign(response, {
            state: 200,
            message: "Success",
            access_Token: accesstoken,
            refresh_token: refresh_token,
          });
        }
      }
    } catch (e) {
      console.log("Lỗi server:", e.message);
      Object.assign(response, {
        state: 500,
        message: "Lỗi server",
      });
    }
  }
  res.status(response.state).json({ response });
};


// Hàm lấy tất cả users
module.exports.GetAllUsers = async(req,res) =>{
    try {
      const user = await User.find();
      if(!user){
        return res.status(404).json({message: "user not found"});
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({message : error.message});
    }
};


// Hàm lấy tổng doanh thu sách theo năm
module.exports.GetTotalRevenue = async(req,res)=>{
  try {
    let total = 0;
    let totalUserTable = 0;
    let totalUserBook = 0; 
    const userBook = await UserBook.find().select('book_detail.price');
     const userTable = await UserTable.find().populate("table_id","price");
    console.log(userBook);
    console.log(userTable);
    for(const itemUserBook of userBook ){
        totalUserBook += itemUserBook.book_detail.price;
    };
    for(const itemUserTable of userTable){
      totalUserTable += itemUserTable.table_id.price;
    };
    total = totalUserBook + totalUserTable;
    return res.status(200).json({data: total});
  } catch (error) {
    res.status(500).json({message : error.message});
  }
}