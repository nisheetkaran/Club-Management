//taskapp
//Harsh@123
const express= require('express')
const multer = require('multer')
const bodyParser=require('body-parser')
const auth = require('./src/middleware/auth')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser")
const mime = require('mime')
const dotenv = require("dotenv")
require('./db/mongoose')

dotenv.config()
const CoOrdinator= require('./models/coordinator')
const Member = require('./models/member')
const Admin = require('./models/admin')
const Club = require('./models/club')
const Chat = require('./models/chat')

const app = express()
const port = process.env.port || 3000
const io = require('socket.io')(8000);

app.use(express.json())
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

app.use(bodyParser.urlencoded({extended:false})) 
app.use(bodyParser.json()) 

app.use(cookieParser())

let otp


const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
});

// app.post('/coordinators', async (req, res)=>{
//     const coordinator = new CoOrdinator(req.body)

//     try{
//         await coordinator.save()
//         res.status(201).send(coordinator)
//     }catch(e){
//         res.status(400).send(e)
//     }
// })


app.get("/adminProfile",(req,res)=>{
    res.render("adminProfile",{email:"kartik@gmail.com",header:"Admin Dashboard",whomToLogin:"Member",name:"Kartik",clubData})
})

app.get("/changePassword", async (req,res)=>{
    const whomToLogin = req.query.whomToLogin
    const email=req.query.email

    if(whomToLogin=='Member'){
        user = await Member.find({email : {$eq: email}})
    }

    if(whomToLogin=='CoOrdinator'){
        user = await CoOrdinator.find({email : {$eq: email}})
    }

    if(whomToLogin=='Admin'){
        user = await Admin.find({email : {$eq: email}})
    }

    name=user[0].name


    res.render("changePassword",{email,header:"Admin Dashboard",whomToLogin})
})

app.get("/makeAnnouncement", auth, async (req,res)=>{
    // clubName = req.query.name
    const clubName = req.query.name
    const whomToLogin = req.query.whomToLogin
    const email=req.query.email

    if(whomToLogin==="Admin"){
        const user = await Admin.find({email : {$eq: email}})}
    else if(whomToLogin==="CoOrdinator"){
        console.log("1")
        user = await CoOrdinator.find({email : {$eq: email}})
    }
    if(whomToLogin==="Member"){
        console.log("2")
        user = await Member.find({email : {$eq: email}})
    }

    const clubs = await Club.find({'name':clubName})
    const success="notok"

    res.render("posts",{email:user[0].email,header:"Admin Dashboard",whomToLogin,name:user[0].name,posts:clubs[0].posts, clubs, success})

    
})

app.get("/registerCoordinator/:clubName",(req,res)=>{
    const clubName = req.params.clubName
    res.render("registerCoordinator", {email:"kartik@gmail.com",header:"Admin Dashboard",whomToLogin:"Admin",name:"Kartik", clubName})
})

app.get("/addClub", async(req, res)=>{
    res.render("addClub",{email:"kartik@gmail.com",header:"Admin Dashboard",whomToLogin:"Admin",name:"Kartik"})
})


app.get('/coordinators', async (req,res)=>{
    try{
        const coordinators = await CoOrdinator.find({})
        res.send(coordinators)
    } catch(e){
        res.status(500).send(e)
    }
})

app.get('/coordinators/:id', async (req,res)=>{
    const _id = req.params.id

    try{
        const coordinator = await CoOrdinator.findById(_id)
        if(!coordinator){
            return res.status(404).send()
        }

        res.send(coordinator)
    } catch(e){
        res.status(500).send(e)
    }
})

//coordinator login page
app.get('/coordinator', async (req,res)=>{
    const token = req.cookies.jwtoken
    if(token){
    decoded = jwt.verify(token, 'clubmanagement')
    if(decoded){
    decodeduser = await CoOrdinator.find({_id:decoded._id})}
    
    console.log(decodeduser)
    if(!decodeduser[0]){
        console.log('decodeduser not found')
        res.render("login",{whomToLogin:"CoOrdinator",co:''});
   }
   else{
        clubName = decodeduser[0].leader_clubs[0].club
        console.log(clubName)

        const clubs = await Club.find({'name':clubName})
        if(!clubs){
             return res.status(404).send()
        }

        clubMembers = clubs[0].members
        clubCoordinators = clubs[0].coordinators
        console.log(clubMembers)
        console.log(clubCoordinators)
    
        res.render("clubPage",{email:decodeduser[0].email,header:"CoOrdinator Dashboard",whomToLogin:'CoOrdinator',name:decodeduser[0].name,clubMembers,clubCoordinators, clubs})
   }
   }
   else{
    res.render("login",{whomToLogin:"Coordinator",co:''});
   }
})

//member login page
app.get('/member', async (req,res)=>{
    const token = req.cookies.jwtoken
    if(token){
    decoded = jwt.verify(token, 'clubmanagement')
    if(decoded){
    decodeduser = await Member.find({_id:decoded._id})}
    
    console.log(decodeduser)
    if(!decodeduser[0]){
        console.log('decodeduser not found')
        res.render("login",{whomToLogin:"Member",co:''});
   }
   else{
    const clubData = await Club.find({})
    res.render("adminProfile",{email:decodeduser[0].email,header:"Member Dashboard",whomToLogin:"Member",name:decodeduser[0].name,clubData, member:decodeduser[0]})
   }
   }

    else{
        res.render("login",{whomToLogin:"Member",co:''});
    }
})

//member sign up page
app.get('/members', async(req,res)=>{
    res.render("memberSignup")
})

//admin login page
app.get('/admin', async (req,res)=>{
    const token = req.cookies.jwtoken
    if(token){
    decoded = jwt.verify(token, 'clubmanagement')
    if(decoded){
    decodeduser = await Admin.find({_id:decoded._id})}
    
    console.log(decodeduser)
    if(!decodeduser[0]){
    res.render("login",{whomToLogin:"Admin",co:''});
   }
   else{
    const clubData = await Club.find({})
    res.render("adminProfile",{email:decodeduser[0].email,header:"Admin Dashboard",whomToLogin:"Admin",name:decodeduser[0].name,clubData})
   }
   }

    else{
        res.render("login",{whomToLogin:"Admin",co:''});
    }
})


//sign up for member
app.post('/members', async (req, res)=>{
    const member = new Member(req.body)
    const email = req.body.email
    const name = req.body.name

    try{
        if(req.body.password!=req.body.confirmPassword){
            //throw new Error('password and confirm password not same');
            res.status(400).send('password and confirm password not same.')
        }
        await member.save()
        const token = await member.generateAuthToken()
       // res.status(201).send({member,token})


        const members = await Member.findByCredentials(req.body.email, req.body.password)

        res.cookie("jwtoken", token,{
            expires: new Date(Date.now() + 25892000000),
            httpOnly:true
        }) 
    
        console.log(member)
        console.log(member.email)
        const clubData = await Club.find({})

        res.render("adminProfile",{email,header:"Member Dashboard",whomToLogin:"Member",name:member.name,clubData, member:members})



    } catch(e){
        res.status(400).send(e)
    }
})


app.get('/registerCoordinator', async(req,res)=>{
    clubName = req.query
    const clubs = await Club.find(clubName)
    console.log(clubName)
    console.log(clubs)
    res.render("registerCoordinator", {email:"kartik@gmail.com",header:"Admin Dashboard",whomToLogin:"Admin",name:"Kartik", clubs})
    //res.send(clubName)
})


app.post('/registerCoordinator/:club', async(req,res)=>{
    //const clubName = req.query
    const name = req.params.club
    
    email = req.body.email
    coname = req.body.name
    rollNo = req.body.rollNo
    currYear = req.body.Year
    Course = req.body.Course

   
    // console.log(email+coname+rollNo)

    try{
        const coord = await CoOrdinator.findOne({ email })

        if(coord){
            console.log("can be founded")
            clubsearched = coord.leader_clubs[0].club
            console.log(clubsearched)
            if(clubsearched===name){
                return res.status(404).send('Already a coordinator of this club')
            }

            if(clubsearched&&(clubsearched!==name)){
                return res.status(404).send('Already coordinator of another club')
            }

            else if(!clubSearched){
                const club = await Club.findOneAndUpdate(
                    { name },
                    { $push: { 'coordinators' : { name : coname, rollNo, email } } },
                    { new : true }
               )
       
                if(!club){
                    return res.status(404).send('not found')
                }
       
                const coordinator = await CoOrdinator.findOneAndUpdate(
                   { 'name' : coname},
                   { $push: { 'leader_clubs' : { club : name } } },
                   { new : true }
               )
            }
        }

        if(!coord){
            console.log("qwer")
             coordinatordet =  { 
                 'name' : coname,
                  rollNo,
                  email,
                 'Year':currYear,
                  Course,
                 'password':'abcdefgh',
                 'leader_clubs':[{'club':name}]
             }

             const message = {
                from: 'clubmanagement8@gmail.com', // Sender address
                to: email,         // List of recipients
                subject: 'Registered as CoOrdinator', // Subject line
                text: "You are registered as the club coordinator of club " + name +". Login using you email id and password as 'password'"// Plain text body
            };
            transport.sendMail(message, function(err, info) {
                if (err) {
                console.log(err)
                //console.log("haha")
                } else {
                console.log(info);
                }
            });
         

            const newcood = new CoOrdinator(coordinatordet)
            newcood.save()

            const club = await Club.findOneAndUpdate(
                { name },
                { $push: { 'coordinators' : { name : coname, rollNo, email } } },
                { new : true }
           )

            return res.status(200).send('Successful')
        }

        return res.status(200)
    } catch(e){
        res.status(500).send()
    }
})

//admin login backend
app.post('/admin', async(req, res)=>{    
    try{
        const email= req.body.email
        const password= req.body.password 
        const admin = await Admin.findByCredentials(email, password)
        const token = await admin.generateAuthToken()

        res.cookie("jwtoken", token,{
            expires: new Date(Date.now() + 25892000000),
            httpOnly:true
        }) 

        const clubData = await Club.find({})
        res.render("adminProfile",{email:admin.email,header:"Admin Dashboard",whomToLogin:"Admin",name:admin.name,clubData})
    } catch(e){
        res.render("login",{co:'ok',whomToLogin:'Admin'})
    }
})

//login coodinator backend
app.post('/coordinator', async(req, res)=>{
    try{
        const coordinator = await CoOrdinator.findByCredentials(req.body.email, req.body.password)
        const token = await coordinator.generateAuthToken()

        res.cookie("jwtoken", token,{
            expires: new Date(Date.now() + 25892000000),
            httpOnly:true
        }) 

        clubName = coordinator.leader_clubs[0].club
        console.log(clubName)

         const clubs = await Club.find({'name':clubName})
         if(!clubs){
             return res.status(404).send()
         }

         clubMembers = clubs[0].members
         clubCoordinators = clubs[0].coordinators
         console.log(clubMembers)
         console.log(clubCoordinators)
        
         res.render("clubPage",{email:coordinator.email,header:"CoOrdinator Dashboard",whomToLogin:'CoOrdinator',name:coordinator.name,clubMembers,clubCoordinators, clubs})
    } catch(e){
        res.render("login",{co:'ok',whomToLogin:'CoOrdinator'})
    }
})

//member login backend
app.post('/member',  async(req, res)=>{
    try{
        const member = await Member.findByCredentials(req.body.email, req.body.password)
        const token = await member.generateAuthToken()
        
        res.cookie("jwtoken", token,{
            expires: new Date(Date.now() + 25892000000),
            httpOnly:true
        }) 
    
        console.log(member)
        console.log(member.email)
        const clubData = await Club.find({})

        res.render("adminProfile",{email:member.email,header:"Member Dashboard",whomToLogin:"Member",name:member.name,clubData, member})
         //res.send(member)
    } catch(e){
        res.render("login",{co:'ok',whomToLogin:'Member'})
    }
})

app.get('/profile',async (req,res)=>{
    const whomToLogin=req.query.whomToLogin
    const email=req.query.email
    console.log(email)

    if(whomToLogin==="Admin"){
        user = await Admin.find({email : {$eq: email}})
    }
    else if(whomToLogin==="CoOrdinator"){
        user = await CoOrdinator.find({email : {$eq: email}})        
    }
    else if(whomToLogin==="Member"){
        user = await Member.find({email : {$eq: email}})
    }

    console.log(user[0]+'haha')
    res.render("profile",{email:email,header:"Profile",whomToLogin,name:user[0].name,rollNo:user[0].rollNo,course:user[0].Course})
    
})



app.post('/logout/:whomToLogin/:email', auth, async(req,res)=>{
    const whomToLogin = req.params.whomToLogin
    const email = req.params.email
    
    try{
        if(whomToLogin==="Admin"){
            const tokencookie = req.cookies.jwtoken
            console.log("2")
            console.log(email)
            console.log(tokencookie + ' cookie in logout')
            const user = await Admin.find({email : {$eq: email}})
            console.log(user)
            user[0].tokens= user[0].tokens.filter((token)=>{
                return token.token!== tokencookie
            })
            res.clearCookie("jwtoken")
            console.log('token updated')
            await user[0].save()
            //res.render("login",{whomToLogin})
        }
        else if(whomToLogin==="CoOrdinator"){
            const tokencookie = req.cookies.jwtoken
            console.log("2")
            console.log(email)
            console.log(tokencookie + ' cookie in logout')
            const user = await CoOrdinator.find({email : {$eq: email}})
            console.log(user)
            user[0].tokens= user[0].tokens.filter((token)=>{
                return token.token!== tokencookie
            })
            res.clearCookie("jwtoken")
            console.log('token updated')
            await user[0].save()
            //res.render("login",{whomToLogin})
             
        }
        else if(whomToLogin==="Member"){
            const tokencookie = req.cookies.jwtoken
            console.log("2")
            console.log(email)
            console.log(tokencookie + ' cookie in logout')
            const user = await Member.find({email : {$eq: email}})
            console.log(user)
            user[0].tokens= user[0].tokens.filter((token)=>{
                return token.token!== tokencookie
            })
            res.clearCookie("jwtoken")
            console.log('token updated')
            await user[0].save()
            //res.render("homepage")
        }
        res.redirect("/")              
    } catch(e){
        res.status(500).send()
    }
})

// app.get('/members', async (req,res)=>{
    
//     try{
//         const members = await Member.find({})
//         res.send(members)
//     } catch(e){
//         res.status(500).send(e)
//     }
// })


app.get('/clubdis', auth, async (req,res)=>{
    const clubName = req.query.name
    const whomToLogin = req.query.whomToLogin
    const email=req.query.email

    console.log(whomToLogin)
    console.log(clubName)
    console.log(email)

    try{
        console.log("2")
        if(whomToLogin==="Admin"){
        user = await Admin.find({email : {$eq: email}})
        }
        else if(whomToLogin==="CoOrdinator"){
            console.log("1")
            user = await CoOrdinator.find({email : {$eq: email}})
        }
        if(whomToLogin==="Member"){
            console.log("2")
            user = await Member.find({email : {$eq: email}})
        }
        console.log(user)
         const clubs = await Club.find({'name':clubName})
        if(!clubs){
            return res.status(404).send()
        }

        console.log(user[0].name)
        console.log(clubs)
        clubMembers = clubs[0].members
        clubCoordinators = clubs[0].coordinators

        res.render("clubPage",{email:user[0].email,header:"Admin Dashboard",whomToLogin,name:user[0].name,clubMembers,clubCoordinators, clubs})
    } catch(e){
        res.status(500).send(e)
    }
})


app.get("/sendOtp",(req,res)=>{
    res.render("sendOtp")
})

var emailSetPass
app.post("/sendOtp",async(req,res)=>{
    whomToLogin = req.query.whom
    emailSetPass = req.body.email
    try{
        const member = await Member.findByEmail(emailSetPass)
        otp=Math.floor(Math.random() * 1000000)
        const message = {
            from: 'clubmanagement8@gmail.com', // Sender address
            to: emailSetPass,         // List of recipients
            subject: 'Club Management password reset', // Subject line
            text: "Your OTP is "+ otp// Plain text body
        };
        transport.sendMail(message, function(err, info) {
            if (err) {
            console.log(err)
            //console.log("haha")
            } else {
            console.log(info);
            }
        });
        res.render("resetPassword",{emailAddress:emailSetPass})
    }
    catch(e){
        res.status(400).send("invalid details")
    }
})

app.post("/resetPassword", async (req,res)=>{
    const email = emailSetPass
    const otp1 = req.body.otp
    console.log(email + otp1)
    const password = req.body.password
    //console.log(password)
    const member = await Member.findByEmail(email)
    
    const confirmPassword = req.body.confirmPassword
    if(otp==otp1){
        if(password===confirmPassword){
            const password= await bcrypt.hash(req.body.password, 8)
            console.log(member)         
            member.password=password
            const filter = { email}
            const update = { password};

            // `doc` is the document _after_ `update` was applied because of
            // `returnOriginal: false`
            let doc = await Member.findOneAndUpdate(filter, update, {
                returnOriginal: false
            });
            res.render('homepage')
            //store in db and render homepage
        }
        else{res.status(400).send("invalid details")}
    }
    else{
        res.status(400).send("invalid details")
    }
})


app.post("/changePassword/:who/:email", async (req,res)=>{
    const email = req.params.email
    const who = req.params.who

    const password= await bcrypt.hash(req.body.password, 8)
    console.log(who)
    if(who=='Member'){
            console.log("1")
            const filter = { email}
            const update = { password};

            // `doc` is the document _after_ `update` was applied because of
            // `returnOriginal: false`
            let doc = await Member.findOneAndUpdate(filter, update, {
                returnOriginal: false
            });
            res.send(200)
    }

    if(who=='CoOrdinator'){
            console.log(2)
            console.log(email)
            console.log(who)
            const filter = { email}
            const update = { password};

            // `doc` is the document _after_ `update` was applied because of
            // `returnOriginal: false`
            let doc = await CoOrdinator.findOneAndUpdate(filter, update, {
                returnOriginal: false
            });
            res.send(200)
    }

    if(who=='Admin'){
            const filter = { email}
            const update = { password};

            // `doc` is the document _after_ `update` was applied because of
            // `returnOriginal: false`
            let doc = await Admin.findOneAndUpdate(filter, update, {
                returnOriginal: false
            });
            res.send(200)
    }


    //console.log(email + who)

})


app.post('/deleteMember/:name/:email', async(req,res)=>{
    const name = req.params.name
    const email = req.params.email
    console.log(name + " " + email)

    try{
        const club = await Club.findOneAndUpdate(
             { name },
             { $pull: { 'members' : { email } } },
             { new : true }
        )

        const member = await Member.findOneAndUpdate(
            {email},
            {$pull : {'clubs' : {club : name} }}
        )

        if(!club){
            return res.status(404).send('not found')
        }

      //  res.send(club)
        res.redirect('back')
    } catch(e){
        res.status(500).send()
    }
})

app.post('/deleteCoordinator/:name/:email', async(req,res)=>{
    const name = req.params.name
    const email = req.params.email
    console.log(name + " " + email)

    try{
        const club = await Club.findOneAndUpdate(
             { name },
             { $pull: { 'coordinators' : { email } } },
             { new : true }
        )

        const coordinator = await CoOrdinator.findOneAndUpdate(
            {email},
            {$pull : {'leader_clubs' : {club : name} }}
        )

        if(!club){
            return res.status(404).send('not found')
        }

        // res.send(club)
        res.redirect('back')
    } catch(e){
        res.status(500).send()
    }
})



let uploadFileName,uploadFileId


const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TOKEN_PATH = 'token.json';
  
  function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
  
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
        });
        callback(oAuth2Client);
      });
    });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/data')
    },
    filename: function (req, file, cb) {
        uploadFileName=file.originalname
        cb(null , file.originalname);   
     }
  })
   
const upload = multer({ storage: storage })
var uploadName, headingUpload, bodyUpload, postUpload, createdUpload

async function storeDatabase(name, heading, body, post, created, fileId ){
    console.log('-------')
    console.log(name)
    console.log(heading)
    console.log(body)
    console.log(post)
    console.log(created)
    console.log(fileId)
    console.log('-------')
    const club = await Club.findOneAndUpdate(
        { name },
        { $push: { 'posts' : { heading, body, post, created, fileId} } },
        { new : true },
   )

   if(!club){
    return res.status(404).send('not found')
   }
}

  async function storeFiles(auth) {
    fileName="C:/Users/ASUS/Downloads/clubmanagement/public/data/"+uploadFileName
    if(!uploadFileName){
        storeDatabase(uploadName, headingUpload, bodyUpload, postUpload, createdUpload)
    }
    else{
    var publicurl
    const drive = google.drive({version: 'v3', auth});
    var fileMetadata = {
            'name': fileName
    };
    var media = {
            mimeType: mime.getType(fileName),
            //PATH OF THE FILE FROM YOUR COMPUTER
            body: fs.createReadStream(fileName)
    };
    await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, function (err, file) {
    if (err) {
        console.error(err);
    } else {
        publicurl=file.data.id
        console.log(publicurl)
        console.log('File Id: ', file.data.id);
        console.log(file.data.id)
        storeDatabase(uploadName, headingUpload, bodyUpload, postUpload, createdUpload, file.data.id)
        // uploadFileId = 'https://drive.google.com/file/d/'+publicurl+'/preview'
        // console.log(uploadFileId)

    }
    drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        }
      });
    const webViewLink = drive.files.get({
        fileId: file.data.id,
        fields: 'webViewLink'
    }).then(async response =>{
        await response.data.webViewLink
    });
 });
 uploadFileId = 'https://drive.google.com/file/d/'+publicurl+'/preview'
 console.log(uploadFileId)
}
  }

const querystring = require('querystring'); 


app.post('/upload/:name', upload.single('upload'), async (req,res)=>{
// app.post('/makeAnnouncement', upload.single('upload'), async (req,res)=>{
    uploadName = req.params.name
    console.log(uploadName)
    whomToLogin = req.body.whomToLoginPost
    clubName = req.body.clubNamePost
    email = req.body.emailPost
    userName = req.body.userNamePost

    try{
        console.log('in try ')
        //postUpload = req.file.buffer
        headingUpload = req.body.announcementHeading
        bodyUpload = req.body.makeAnnouncement
        createdUpload = new Date()

        //console.log(postUpload)
        console.log(headingUpload)
        console.log(bodyUpload)
        console.log(createdUpload)

        fs.readFile('credentials.json', async (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
          
            await authorize(JSON.parse(content), storeFiles);
          });

        
        const clubs = await Club.find({'name':clubName})

       // alert("Successfully uploaded");
        
        // res.render("posts",{email,header:"Admin Dashboard",whomToLogin,name:userName,posts:clubs[0].posts, clubs, success:'ok'})  
      ///  res.redirect('back')
       // res.render('home.jade', context);


        res.redirect('back')     

         //res.send(200)
     } catch(e){
         res.status(500).send(e)
     }
})




app.post('/enroll/:name/:email', async(req,res)=>{
    name = req.params.name
    email = req.params.email

    try{
    //member = await Member.find(email)
    member = await Member.find({email : {$eq: email}})
    console.log(member)
    console.log(member[0].rollNo)
    rollNo = member[0].rollNo
    mename = member[0].name

    const club = await Club.findOneAndUpdate(
        { name },
        { $push: { 'members' : { name : mename, rollNo, email } } },
        { new : true }
   )

    member = await Member.findOneAndUpdate(
    { email },
    { $push: { 'clubs' : { club : name } } },
    { new : true }
    )

    res.send(200)
    }catch(e){
        res.status(500).send(e)
    }

})


app.get('/upload/:name', async(req,res)=>{
    res.render('homepage')
})


app.get('/',(req,res)=>{
    res.render("homepage",{});
})

app.post('/addClub', async (req, res)=>{
    console.log(req.body)
    name = req.body.clubName
    console.log(name)
    addclubdet =  { 
        name
    }

    const newClub = new Club(addclubdet)

    try{
        await newClub.save()
        res.status(201).send(newClub)
    }catch(e){
        res.status(400).send(e)
    }
    //newClub.save()

})


app.listen(port, ()=>{
    console.log('Server is up on port ' + port)
})


// Node server which will handle socket io connections
// const io = require('socket.io')(8000);

const users = {};

io.on('connection', socket =>{
   Chat.find().then(result=>{
       socket.emit('output-messages', result)
   })

    // If any new user joins, let other users connected to the server know!
    socket.on('new-user-joined', name =>{ 
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    // If someone sends a message, broadcast it to other people
    socket.on('send', message =>{
        chatdet =  { 
            'name' : users[socket.id],
            'msg': message
        }

        const newchat = new Chat(chatdet)
        newchat.save()
        
        //console.log(req.query.name)
        socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
    });

    // If someone leaves the chat, let others know 
    socket.on('disconnect', message =>{
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });


})