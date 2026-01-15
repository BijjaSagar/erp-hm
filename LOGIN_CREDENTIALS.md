# 🔐 HM-ERP Login Credentials

## Admin Account

**Email:** `admin@hm-erp.com`  
**Password:** `admin123`  
**Role:** ADMIN  
**Branch:** HM1  

---

## Other Test Accounts

### Branch Manager
**Email:** `manager@hm-erp.com`  
**Password:** `manager123`  
**Role:** BRANCH_MANAGER  
**Branch:** HM2  

### Operator
**Email:** `operator@hm-erp.com`  
**Password:** `operator123`  
**Role:** OPERATOR  

---

## 🚀 Login URL

**Production:**  
https://erp-iknph1aml-sagar-bijjas-projects.vercel.app/login

**Or visit:**  
https://erp-hm.vercel.app/login

---

## 📋 What You Can Test

### As Admin (admin@hm-erp.com):
✅ View all branches (HM1, HM2, HP1, HP2)  
✅ Manage employees  
✅ Create and edit orders  
✅ View production tracking  
✅ Access all modules  
✅ Edit stores  
✅ Manage attendance  
✅ Delete employees  
✅ See PLYWOOD_FITTING stage  

### As Branch Manager (manager@hm-erp.com):
✅ Manage their branch (HM2)  
✅ View orders  
✅ Manage employees in their branch  
✅ Track production  

### As Operator (operator@hm-erp.com):
✅ View operator dashboard  
✅ Update production stages  
✅ Log production activities  

---

## 🎯 Features to Test

1. **Branch Names** - Check if showing HM1, HM2, HP1, HP2
2. **Store Edit** - Go to Stores → Click Edit
3. **Attendance Checkout** - Go to Attendance → Click Checkout
4. **Employee Delete** - Go to Employees → Edit → Delete button
5. **PLYWOOD_FITTING Stage** - Create/view orders, check production stages
6. **All Dashboard Features** - Revenue, orders, employees, etc.

---

## ⚠️ Important Notes

- These are **test credentials** from the seed file
- The database has been seeded with sample data
- All passwords are hashed using bcrypt
- Change passwords in production for security

---

## 🔄 If You Need to Reset Data

Run the seed command:
```bash
npx prisma db seed
```

This will recreate all test users and sample data.

---

## ✅ Quick Test Checklist

- [ ] Login with admin credentials
- [ ] Verify role displays correctly (not "Role: None")
- [ ] Check branch names are HM1, HM2, HP1, HP2
- [ ] Test store edit functionality
- [ ] Test attendance checkout button
- [ ] Test employee delete button
- [ ] Verify PLYWOOD_FITTING appears in production stages
- [ ] Check all dashboard data loads

---

**All credentials are ready to use!** 🎉
