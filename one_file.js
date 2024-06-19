

class GameObjectRect extends GameObject{
    constructor(name, x = 0, y = 0,width=0,height=0,color='purple') {
        super(name,x,y);
        
        this.collidable = true;
        
        this.isVisible = true;
        
        this.width=width;
        
        this.height = height;
        
        this.color = color||'purple';
    }
    
    changeVisibility = (state) => {
        this.isVisible = state;
    }

    
    setCollidable = (state) => {
        this.collidable = state;
    }

    
    
    disableObject = () => {
        this.isVisible = false
        this.collidable = false;
    }
    
    
    enableObject = () => {
        this.isVisible = true;
        this.collidable = true;
    }

    
    setColor = (color)=>{
        this.color=color;
    }
    
    getColor = () =>{
        return this.color;
    }
    
    drawObject = (ctx) =>{
        if(this.isVisible){
            ctx.fillStyle=this.color;
            ctx.beginPath();
            ctx.rect(this.x,this.y,this.width,this.height);
            ctx.fill();
        }
    }

}

class TriggerRect extends GameObjectRect{
    constructor(name,x,y,width,height,color,onEnter,show=false,detectName='Player',oneTime=false){
        super(name,x,y,width,height,color);
        
        this.isTriggered = false;
        
        this.triggerEnter = onEnter;
        this.isVisible = show;
        
        this.detectName = detectName;
        
        this.triggerable=true;
        
        this.oneTime=oneTime;
    }

    
    setDetectName = (name) => {
        this.detectName = name;
    }
    
    getDetectName = () => {
        return this.detectName;
    }

    
    disableObject = () => {
        this.collidable = false;
        this.triggerable = false;
    }
    
    enableObject = () => {
        this.collidable = true;
        this.triggerable = true;
    }


    drawObject = (ctx)=>{
        if(this.isVisible){
            ctx.fillStyle=this.color;
            ctx.beginPath();
            ctx.rect(this.x,this.y,this.width,this.height);
            ctx.fill();
        }
    }

    
    setOnTriggerEnterEvent = (func) => {
        this.triggerEnter = func;
    }

    
    onTrigger = (obj) => {
        
        if (this.triggerable) {
            
            if (!(obj instanceof ConstObject) || !(obj instanceof GameObjectRect)) {
                if (this.isInTrigger(obj)) {
                    this.triggerEnter();
                    if(this.oneTime){
                        this.triggerable=false;
                    }
                }
            }
        }
    }

    
    isInTrigger = (obj) => {
        if (obj.name == this.detectName) {
            return this.checkCollisionWith(obj);
        }
        else {
            return false;
        }
    }
    
    checkCollisionWith = (obj2) => {
        if (this.collidable) {
            const collisionX = this.x < obj2.x + obj2.width && this.x + this.width > obj2.x;
            const collisionY = this.y < obj2.y + obj2.height && this.y + this.height > obj2.y;
            return collisionX && collisionY;
        }
    }
}



class RigidBody extends GameObjectRect{
    constructor(attachedObj,mass=0,show=false){
        super(`${attachedObj.getName()}_rb`,attachedObj.x,attachedObj.y,attachedObj.width,attachedObj.height,'black',show);
        this.collidable=false
        
        this.velocity={x:0,y:0}
        
        this.mass=mass;
        this.isVisible=show;
        
        this.gravity=GRAVITY;
        
        this.attachedObj = attachedObj;
        
        this.isKinematic=false;
    }
    
    setKinematic = (state)=>{
        this.isKinematic=state;
    }
    
    assignAttachedObject = (obj)=>{
        this.attachedObj = obj;
    }
    
    removeAttachedObject = ()=>{
        this.attachedObj=undefined;
    }
    
    setVelocity = (forceX,forceY)=>{
        this.velocity = {x:forceX,y:forceY};
    }
    
    setVelocityX = (x)=>{
        this.velocity.x=x;
    }
    
    setVelocityY = (y)=>{
        this.velocity.y=y;
    }
    
    getVelocity = ()=>{
        return this.velocity;
    }

    
    updatePosition = () => {
        let newX = this.x + this.velocity.x * this.mass;
        if (!this.checkSideCollisions(newX)) {
            this.x = newX;
        } else {
            if(!this.isKinematic)
                this.velocity.x = 0;
        }

        if (!this.onGround) {
            if(!this.isKinematic)
                this.velocity.y += this.gravity*this.mass;
        }
        let newY = this.y + this.velocity.y;
        if (!this.checkTopBottomCollisions(newY)) {
            this.y = newY;
        } else {
            if (this.velocity.y > 0&&(!this.isKinematic)) {
                this.onGround = true;
            }
            if(!this.isKinematic)
                this.velocity.y = 0;
        }
        if(this.attachedObj!=undefined){
            this.attachedObj.setPosition(this.x,this.y);
        }
    }
    
    drawObject = (ctx) => {
        this.updatePosition();
        if(this.isVisible){
            ctx.fillStyle=this.color;
            ctx.beginPath();
            ctx.rect(this.x,this.y,this.width,this.height);
            ctx.fill();
        }
    }
   
    checkCollisionWith = (obj2) => {
        if(this.collidable){
            const collisionX = this.x < obj2.x + obj2.width && this.x + this.width > obj2.x;
            const collisionY = this.y < obj2.y + obj2.height && this.y + this.height > obj2.y;
            return collisionX && collisionY;
        }
    }
   
    checkSideCollisions = (x) => {
        for (let obj of game.objects) {
            if(obj.collidable){
                if (obj != this && !(obj instanceof Trigger) && !(obj instanceof TriggerRect) && this.checkSideCollider(obj, x)) {
                    return true;
                }
        }
        }
        return false;
    }
   
    checkTopBottomCollisions = (y) => {
        for (let obj of game.objects) {
            if(obj.collidable){
                if (obj != this && !(obj instanceof Trigger) && !(obj instanceof TriggerRect) && this.checkTopBottomCollider(obj,y)) {
                    return true;
                }
        }
        }
        return false;
    }
    
    checkSideCollider = (obj, offsetX) => {
        if(obj!=this.attachedObj){
        const collisionX = offsetX < obj.x + obj.width && offsetX + this.width > obj.x;
        const collisionY = this.y < obj.y + obj.height && this.y + this.height > obj.y;
        return collisionX && collisionY;
        }
    }

    
    checkTopBottomCollider = (obj,offsetY) => {
        if(obj!=this.attachedObj){
        const collisionX = this.x < obj.x + obj.width && this.x + this.width > obj.x;
        const collisionY = offsetY < obj.y + obj.height && offsetY + this.height > obj.y;
        return collisionX && collisionY;
        }
    }
   
    detectCollision = (obj) => {
        if(obj.collidable){
            if (this.checkCollisionWith(obj)) {
                this.velocity.y = 0;
                this.onGround = true;
            } else if (!this.checkTopBottomCollisions(this.y + 1)) {
                this.gravity = GRAVITY;
                this.onGround = false;
            }
        }
    }
}



LevelBoundries = (game) =>{
    return [new GameObjectRect('wall',game.canvas.width,-150,10,game.canvas.height+200,'red',false),new GameObjectRect('wall',0,-150,0,game.canvas.height+200,'red',false),new ConstObject("floor", -150, game.canvas.height - 30, 'grass.png',game.canvas.width*2,50)
]
}


let Alter = (x,y,src,onEnter,detectName)=>{
    let alter = new ConstObject('alter',x,y,src,100,50);
    let alterTrigger = new TriggerRect('alterTrigger',alter.x,alter.y-50,100,50,'red',onEnter,false,detectName);
    return {alter:alter,trigger:alterTrigger};
}

let Portal = (game,start,end)=>{
    let teleportImg = new ConstObject('tp1',end.x,end.y,'portalU.png',100,50,true);
    teleportImg.setCollidable(false);
    let teleportImg2 = new ConstObject('tp1',start.x,start.y,'portalD.png',100,10,true);
    let tpTrigger = new TriggerRect('tpTrigger',(teleportImg2.x+teleportImg2.width)-70,teleportImg2.y-10,50,20,'red',()=>{game.actualCharacter.setPosition(teleportImg.x,teleportImg.y+50);game.playAudioClip('portal.wav')},false);
    teleportImg2.setCollidable(false);
    return [teleportImg,teleportImg2,tpTrigger];
}

let DialogBox = (SCENE,game,text,img='robot.png')=>{
    let InfoPanel = new UIImage('info',0,100,'panel.png',game.canvas.width,150);
    let bot_img = new UIImage('robot',InfoPanel.x,InfoPanel.y+20,img,100,100);
    let info = new UIText('info',bot_img.x+bot_img.width,bot_img.y+50,text,25,'white');
    let PanelBoxExit = new TriggerRect('dialogBoxFinish',(game.canvas.width/2)-100,(game.canvas.height-220),90,game.canvas.height,'yellow',()=>{onTriggerShutDownElements()},false);
    onTriggerShutDownElements = ()=>{
        InfoPanel.disableElement();
        bot_img.disableElement();
        info.disableElement();
    }
    SCENE.objects.push(PanelBoxExit)
    SCENE.UI.push(InfoPanel);
    SCENE.UI.push(info);
    SCENE.UI.push(bot_img);
}



FirstScene = (game) =>{
    
    let Scene = {bg:'imgs/bgs/bg1.png',objects:[],UI:[],playerStartPos:{x:100,y:game.canvas.height-120},onLoad:()=>{},static:false,ost:'level1.wav'};
    
    let LevelElements = [
        new ConstObject("floor", game.canvas.width/2-100,game.canvas.height-100, 'platform.png',100,50),
        new ConstObject('floor2',game.canvas.width/2,game.canvas.height-250,'platform.png',100,50),
        new ConstObject('floor2',game.canvas.width/2+200,game.canvas.height-400,'platform.png',200,50),
        new Item('endFlag',game.canvas.width/2+300,game.canvas.height-500,'flag.png',0,()=>{game.loadNewScene(2)})
    ]
    
    Scene.onLoad = ()=>{game.playAudioClip('info_dialog_1.wav');};
    DialogBox(Scene,game,'Use ARROWS to move, use SPACE to jump, use C to reborn');
    Scene.objects.push(...LevelBoundries(game))
    Scene.objects.push(...LevelElements);

    return Scene;
}

SceneTwo = (game) =>{
    let Scene = {bg:'imgs/bgs/bg1.png',objects:[],UI:[],playerStartPos:{x:100,y:game.canvas.height-120},onLoad:()=>{},static:false,ost:'level1.wav'};

    let LevelElements =[
        coin = new Item('endFlag',game.canvas.width-100,game.canvas.height/2,'flag.png',0,()=>{game.loadNewScene(3)}),
        new GameObjectRect('wall',game.canvas.width/2+100,game.canvas.height/2+50,50,game.canvas.height,'black'),

        new ConstObject("floor", game.canvas.width/2-150,game.canvas.height-80, 'platform.png',150,50),
        new ConstObject("floor", game.canvas.width/2,game.canvas.height-200, 'platform.png',100,50),
        new ConstObject("floor", game.canvas.width-100,coin.y+100, 'platform.png',100,50),
        new ConstObject("floor", game.canvas.width-250,coin.y+220, 'platform.png',100,50)

    ]
    Scene.objects.push(...LevelElements);
    Scene.objects.push(...LevelBoundries(game))

    return Scene;
}

SceneThird = (game)=>{
    let Scene = {bg:'imgs/bgs/bg2.png',objects:[],UI:[],playerStartPos:{x:100,y:0},onLoad:()=>{},static:false,ost:'level1.wav'};

    let spikes = []
    let startX=game.canvas.width/2-200;
    let endX =startX;
    for(let a=0;a<5;a++){
        spikes.push(new Trigger('spikes',game.canvas.width-endX,game.canvas.height-80,'spikes.png',0,()=>{game.killActualCharacter(false)},true));
        endX+=50;
    }

    let LevelElements = [
    new ConstObject('floor',spikes[spikes.length-1].x-55,game.canvas.height-70,'platform.png',50,40),
    new ConstObject('floor',spikes[0].x+60,game.canvas.height-70,'platform.png',50,40),
    new ConstObject('floor',game.canvas.width-50,game.canvas.height-150,'platform.png',50,50),
    new ConstObject('floor',game.canvas.width/2+100,game.canvas.height-400,'platform.png',150,50),
    new ConstObject('floor',game.canvas.width/2+250,game.canvas.height-300,'platform.png',50,50),
    new Item('endFlag',game.canvas.width/2+100,game.canvas.height-500,'flag.png',0,()=>{game.loadNewScene(4)})
    ]
    Scene.objects.push(...LevelBoundries(game))
    Scene.objects.push(...LevelElements);
    Scene.objects.push(...spikes);
    return Scene;
}

SceneForth = (game)=>{
    let Scene = {bg:'imgs/bgs/bg2.png',objects:[],UI:[],playerStartPos:{x:100,y:game.canvas.height-120},onLoad:()=>{},static:false,ost:'reveal.wav'};


    let flag = new Item('endFlag',game.canvas.width-100,game.canvas.height/2,'flag.png',0,()=>{game.loadNewScene(5)});
    flag.isVisible=false;
    flag.disableObject();
    let flagGound = new ConstObject('flagGround',flag.x,flag.y+flag.height,'platform.png',100,50);
    flagGound.disableObject();

    let flagPost = [flag,flagGound];

    let floatPlatform = new ConstObject("floor", game.canvas.width/2-100,game.canvas.height-100, 'platform.png',200,50);
    let alterStand = new ConstObject('alter',(floatPlatform.x+floatPlatform.y)/2-50,floatPlatform.y-40,'activator_red.png',100,50);
    let alterTrigger = new TriggerRect('alterTrigger',alterStand.x,alterStand.y-50,100,50,'red',()=>{flag.isVisible=true;flag.enableObject();flagGound.enableObject()},false,'PlayerCorpse');
    let alter = [alterStand,alterTrigger];
    DialogBox(Scene,game,'Press C to Sacrifice on the platform','robot_bad.png');
    Scene.objects.push(...LevelBoundries(game))
    Scene.objects.push(...alter);
    Scene.onLoad = ()=>{game.audioController.volume=0.6;game.playAudioClip('info_dialog_2.wav');};
    Scene.objects.push(floatPlatform);
    Scene.objects.push(...flagPost);

    return Scene;
}

SceneFifth = ()=>{
    let Scene = {bg:'imgs/bgs/bg3.png',objects:[],UI:[],playerStartPos:{x:100,y:game.canvas.height-150},onLoad:()=>{},static:false,ost:'reveal.wav'};
    let flag = new Item('endFlag',game.canvas.width-100,game.canvas.height-170,'flag.png',0,()=>{game.loadNewScene(6)});
    let flagBlocade = new GameObjectRect('block',flag.x,flag.y,10,100,'red');
    let LevelElements = [
        new ConstObject('platform',flag.x-20,flag.y+95,'platform.png',120,50),
        new ConstObject('platform',flag.x-20,flag.y-50,'platform.png',120,50)
    ]

    let AlterGreen = new ConstObject('alterG',game.canvas.width/2-100,game.canvas.height-70,'activator_green.png',100,50);

    let AlterRed = new ConstObject('alterG',LevelElements[1].x+20,LevelElements[1].y-40,'activator_red.png',100,50);
    let platformToRed = new ConstObject('path',AlterRed.x-150,AlterRed.y+50,'platform.png',100,50);
    platformToRed.disableObject();
    let alterGreenTrigger = new TriggerRect('alterTrigger',AlterGreen.x,AlterGreen.y-50,100,50,'red',()=>{platformToRed.enableObject();},false,'PlayerCorpse');
    let alterRedTrigger = new TriggerRect('alterTrigger',AlterRed.x,AlterRed.y-50,100,50,'red',()=>{flagBlocade.disableObject()},false,'PlayerCorpse');

    DialogBox(Scene,game,`Existence is just a number`);
    Scene.onLoad = () =>{
        game.playAudioClip('dialog_level_5_1.wav');
    }
    
    Scene.objects.push(platformToRed);
    Scene.objects.push(flag);
    Scene.objects.push(AlterRed);
    Scene.objects.push(AlterGreen);
    Scene.objects.push(flagBlocade);
    Scene.objects.push(alterGreenTrigger);
    Scene.objects.push(alterRedTrigger);
    Scene.objects.push(...LevelElements);
    
    
    Scene.objects.push(...LevelBoundries(game))
    return Scene;
}

SceneSix = (game)=>{
    let Scene = {bg:'imgs/bgs/bg4.png',objects:[],UI:[],playerStartPos:{x:100,y:game.canvas.height-150},onLoad:()=>{},static:false,ost:'reveal.wav'};

    let LevelElements = [
        new ConstObject('xd',300,game.canvas.height-200,'platform.png',100,100),
        new ConstObject('xd',0,200,'platform.png',200,50)
    ]
    let flag = new Item('flag',game.canvas.width-100,0,'flag.png',0,()=>{game.loadNewScene(7)});
    let flagRB = new RigidBody(flag,4);
    let BluePlatform = new GameObjectRect('',game.canvas.width-100,150,100,25,'blue');
    let RedPlatform = new GameObjectRect('',game.canvas.width-250,150,100,25,'red');
    Scene.objects.push(RedPlatform);

    let SecondAlter = Alter(RedPlatform.x,RedPlatform.y-70,'activator_blue.png',()=>{BluePlatform.disableObject()},'PlayerCorpse');
    let rb= new RigidBody(SecondAlter.alter,7);
    let rb2=new RigidBody(SecondAlter.trigger,7);
    let alter = Alter(0,165,'activator_red.png',()=>{RedPlatform.disableObject()},'PlayerCorpse');
    Scene.objects.push(SecondAlter.alter,SecondAlter.trigger,rb,rb2);
    Scene.objects.push(alter.alter);
    Scene.objects.push(alter.trigger);
    Scene.objects.push(...LevelElements);
    Scene.objects.push(BluePlatform);
    Scene.objects.push(flagRB);
    Scene.objects.push(flag);

    Scene.objects.push(...LevelBoundries(game))
    return Scene;
}

SceneSeven = (game)=>{
    let Scene = {bg:'imgs/bgs/bg5.png',objects:[],UI:[],playerStartPos:{x:20,y:300},onLoad:()=>{},static:false,ost:'level4.wav'};
    let flag = new Item('flag',game.canvas.width-100,0,'flag.png',0,()=>{game.loadNewScene(8)});
    let LevelElements = [
        new ConstObject('xd',300,game.canvas.height-150,'platform.png',200,50),
        new ConstObject('xd',0,150,'platform.png',250,50),
        new ConstObject('xd3',flag.x-120,flag.y+95,'platform.png',500,50),
        new ConstObject('xd4',0,350,'platform.png',200,50),
        new ConstObject('xd5',game.canvas.width-200,game.canvas.height-300,'platform.png',250,50)
    ]

    let blockersWallGreen = [
        new GameObjectRect('blockAlter1',180,game.canvas.height-202,20,500,'green'),
        new GameObjectRect('blockAlter2',game.canvas.width-200,game.canvas.height-250,20,250,'green')
    ];
    Scene.objects.push(...blockersWallGreen);
    let portalOne = Portal(game,{x:game.canvas.width/2-50,y:game.canvas.height-50},{x:40,y:410});
    Scene.objects.push(...portalOne);
    
    
    let redFlagWall = new GameObjectRect('redwall',game.canvas.width-200,0,20,100,'red');
    let alterRed = Alter(350,game.canvas.height-190,'activator_red.png',()=>{
        if(!blockersWallGreen[0].isVisible)
        redFlagWall.disableObject();
    },'PlayerCorpse');
    Scene.objects.push(alterRed.alter,alterRed.trigger);
    Scene.objects.push(redFlagWall);
    let alterGreen = Alter(40,game.canvas.height-70,'activator_green.png',()=>{
        blockersWallGreen.forEach(e=>{
            e.disableObject();
        })
        portalOne.forEach(e=>{
            e.disableObject();
        })
    },'PlayerCorpse')

    let BlueBlockersWalls = [
        new GameObjectRect('w1',alterRed.alter.x-50,alterRed.alter.y-50,20,100,'blue'),
        new GameObjectRect('w2',alterRed.alter.x+130,alterRed.alter.y-50,20,100,'blue'),
        new GameObjectRect('w3',alterRed.alter.x-50,alterRed.alter.y-50,200,20,'blue'),
    ]
    Scene.objects.push(...BlueBlockersWalls);

    let portalTwo = Portal(game,{x:game.canvas.width-120,y:game.canvas.height-310},{x:0,y:0});
    let AlterBlue = Alter(game.canvas.width-150,game.canvas.height-70,'activator_blue.png',()=>{
        BlueBlockersWalls.forEach(e=>{
            e.disableObject();
        })
    },'PlayerCorpse')

    Scene.objects.push(...portalTwo,AlterBlue.alter,AlterBlue.trigger);
    Scene.objects.push(alterGreen.alter,alterGreen.trigger);
    Scene.objects.push(flag);
    Scene.objects.push(...LevelElements);
    Scene.objects.push(...LevelBoundries(game))
    return Scene;
}

Ending = (game)=>{
    let floor =new ConstObject("floor", -150, game.canvas.height - 30, 'grass.png',game.canvas.width*2,50)
    let Scene = {bg:'imgs/bgs/reality.png',objects:[],UI:[],playerStartPos:{x:-100,y:-100},onLoad:()=>{},static:false,ost:'peace.wav'};
    let exitSign = new UIText('exit',game.canvas.width-100,game.canvas.height-250,'EXIT',40,'red');
    let fakeBg = new ConstObject('fakebg',0,0,'/bgs/bg6.jpg',game.canvas.width,game.canvas.height-31);
    let fakeBgRb = new RigidBody(fakeBg,10,false);
    fakeBgRb.setKinematic(true);
    fakeBg.collidable=false;
    Scene.objects.push(fakeBg,exitSign,fakeBgRb);
    let InfoPanel = new UIImage('info',0,100,'panel.png',game.canvas.width,150);
    let bot_img = new UIImage('robot',InfoPanel.x,InfoPanel.y+20,'robot_bad.png',100,100);
    let info = new UIText('info',bot_img.x+bot_img.width,bot_img.y+50,`HA HA HA it's only an illusion of choice`,25,'white');
    let PanelBoxEnter = new TriggerRect('dialogBoxFinish',(game.canvas.width)-110,(game.canvas.height-220),90,game.canvas.height,'yellow',()=>{onTriggerShutDownElements()},false,'playerIcon',true);
    InfoPanel.disableElement();
    bot_img.disableElement();
    info.disableElement();

    onTriggerShutDownElements = ()=>{
        InfoPanel.enableElement();
        bot_img.enableElement();
        info.enableElement();
    }
    Scene.objects.push(InfoPanel,bot_img,info,PanelBoxEnter);
    let doors = new GameObjectRect('doors',game.canvas.width-100,game.canvas.height-200,100,300,'black');
    Scene.objects.push(doors);
    let PlayerIcon = new ConstObject('playerIcon',0,game.canvas.height-80,'player_icon.png',50,50);
    PlayerIcon.collidable=false;
    let playerRigidbody = new RigidBody(PlayerIcon,1);
    playerRigidbody.setVelocityX(2);

    let panel = new UIImage('img',(game.canvas.width/2)-100,(game.canvas.height/2)+10,'panel.png',200,100);
    let panelText =new UIText('enter',(panel.x+panel.width)/1.6,panel.y+50,'ENTER to continue',20,'white');
    panel.disableElement();
    panelText.disableElement();
    Scene.objects.push(panel,panelText);

    let trigger = new TriggerRect('stopTrigger',game.canvas.width-110,game.canvas.height-35,100,50,'red',()=>{
        playerRigidbody.setVelocity(0,0);
        game.playLevelAudio('war.wav');
        doors.disableObject();
        exitSign.disableElement();
        fakeBgRb.setVelocity(0,-2);
        game.playAudioClip('info_dialog_final.wav');
        panel.enableElement();
        panelText.enableElement();
        console.log('chuuuj');
    }
        ,false,'playerIcon_rb',true);
    Scene.onLoad = ()=>{
            game.assignMainEvent((e)=>{
                if(e.code=='Enter')
                    game.loadNewScene(9)});
        }
        Scene.objects.push(floor);
    Scene.objects.push(PlayerIcon,playerRigidbody,trigger);
    return Scene;
}

EndCredits = (game)=>{
    let Scene = {bg:'imgs/real.jpg',objects:[],UI:[],playerStartPos:{x:-100,y:-100},onLoad:()=>{},static:false,ost:'menu.wav'};
    let BlackScreen = new GameObjectRect('black',0,0,game.canvas.width,game.canvas.height,'black');
    BlackScreen.collidable=false;
    Scene.objects.push(BlackScreen);
    let title = new UIText('gameTitle',game.canvas.width/2-150,game.canvas.height+100,'Another Bob',50,'white');
    let titleRb = new RigidBody(title,1);
    titleRb.setKinematic(true);
    titleRb.setVelocity(0,-1);
    let titleCreator = new UIText('creatorTitle',game.canvas.width/2-100,game.canvas.height+150,'LEAD DEVELOPER',20,'white');
    let titleCreatorRb = new RigidBody(titleCreator,1);
    titleCreatorRb.setKinematic(true);
    titleCreatorRb.setVelocity(0,-1);
    let Creator = new UIText('creatorTitle',game.canvas.width/2-100,game.canvas.height+200,'Tomasz Podoba',25,'white');
    let CreatorRb = new RigidBody(Creator,1);
    CreatorRb.setKinematic(true);
    CreatorRb.setVelocity(0,-1);

    let endTrigger = new TriggerRect('trigger',0,-100,game.canvas.width,20,'red',()=>{
        game.loadNewScene(0);
    },true,'creatorTitle_rb');
    Scene.objects.push(title,titleRb,titleCreator,titleCreatorRb,Creator,CreatorRb,endTrigger);
    return Scene;
}
MainMenu = (game) =>{
    let Scene = {bg:'imgs/level1.jpg',objects:[],UI:[],playerStartPos:{x:100,y:game.canvas.height-120},onLoad:()=>{},static:true,ost:'menu2.wav'};
    
    let Title = new UIText('title',game.canvas.width/2-150,game.canvas.height/2-50,'Another Bob',50,'white');
    let player = new UIImage('player',game.canvas.width/2-60,game.canvas.height/2,'player_icon.png',100,100);
    Scene.onLoad = ()=>{
        game.assignMainEvent((e)=>{
            if(e.code=='Enter')
                game.loadNewScene(1)});
    }
    let Start = new UIText('start',game.canvas.width/2-250,player.y+player.height+50,'Press ENTER to start',50,'white');
    Scene.UI.push(Start);
    Scene.UI.push(Title);
    Scene.UI.push(player);
    return Scene;
}



LOAD_LEVEL = (game,id)=>{
    game.sceneID=id;
    switch(id){
        case 0:
            return MainMenu(game);
        case 1:
            return FirstScene(game);
        case 2:
            return SceneTwo(game); 
        case 3:
            return SceneThird(game);
        case 4:
            return SceneForth(game);
        case 5:
            return SceneFifth(game);
        case 6:
            return SceneSix(game);
        case 7:
            return SceneSeven(game);
        case 8:
            return Ending(game);
        case 9:
            return EndCredits(game);
        default:
            return MainMenu(game);
    }
}

let msPrev = window.performance.now();
let fps = 60;
const msPerFrame = 1000/fps;

const GRAVITY = 1;

class Game {
    
    sceneID = 0;
    canvas = document.getElementById("mainCanvas");
    ctx = this.canvas.getContext('2d');
    init = () => {
        
        this.mainEvent=this.assignMainEvent(()=>{});
        
        this.audioController = new Audio();
        
        this.audioController.volume=0.3;
        
        this.levelMusic = new Audio();
        this.score =0;
        this.deaths=0;
        
        this.objects = [];
        
        this.UIElements = []
        
        this.LevelUIElements = [];
        this.loadAudio();
        
        
        this.level = LOAD_LEVEL(this,8);
        this.playLevelAudio(this.level.ost);
        
        this.assignEventsListeners();
        
        this.playerTemplate = {name:"Player",x:this.level.playerStartPos.x,y:this.level.playerStartPos.y,src:'player_sheet.png',w:50};
        
        this.actualCharacter = this.createNewPlayer();
        
        this.background = new Image();
        this.background.src=this.level.bg;
        this.objects.push(...this.level.objects);
        this.loadLevelUI();
        this.LevelUIElements.push(...this.level.UI);
        this.level.onLoad();
        requestAnimationFrame(this.Update)        
    }

    
    resetLevel = () =>{
        this.assignMainEvent(()=>{});
        this.audioController = new Audio();
        this.audioController.volume=0.3;
        this.levelMusic = new Audio();
        this.score =0;
        this.deaths=0;
        this.objects = [];
        this.UIElements = []
        this.LevelUIElements = [];
        this.loadAudio();
        this.level = LOAD_LEVEL(this,this.sceneID);
        this.playLevelAudio(this.level.ost);
        this.assignEventsListeners();
        this.playerTemplate = {name:"Player",x:this.level.playerStartPos.x,y:this.level.playerStartPos.y,src:'player_sheet.png',w:50};
        this.actualCharacter = this.createNewPlayer();
        this.background = new Image();
        this.background.src=this.level.bg;
        this.objects.push(...this.level.objects);
        this.loadLevelUI();
        this.LevelUIElements.push(...this.level.UI);
        this.level.onLoad();
        requestAnimationFrame(this.Update);
    }

    loadLevelUI = () =>{
        this.UIDeathText = new UIText('deathCounter',this.canvas.width/2,50,this.deaths.toString(),50,'white');
        this.UIDeathLabel = new UIImage('skull',this.UIDeathText.x-60,this.UIDeathText.y-40,'skull.png',50,50);
        this.UIElements.push(this.UIDeathLabel);
        this.UIElements.push(this.UIDeathText);
    }

    loadAudio = () =>{
        this.jumpSound = new Audio();
        this.jumpSound.src = 'sounds/jump.wav';
        this.jumpSound.volume=0.3;
        this.deathSound = new Audio();
        this.deathSound.src = 'sounds/death.wav';
    }

    assignMainEvent = (func)=>{
        document.removeEventListener('keydown',this.mainEvent);
        this.mainEvent=func;
        document.addEventListener('keydown',this.mainEvent);
    }

    changeAudio = (src)=>{
        this.audioController.pause();
        this.audioController.src=`sounds/${src}`;
    }
    playAudio = ()=>{
        this.audioController.play();
    }
    
    playAudioClip = (src)=>{
        this.setAudioClip(this.audioController,src);
        this.playAudio();
    }
    
    setAudioClip = (audio,src)=>{
        audio.src=`sounds/${src}`;
    }
    
    playLevelAudio = (src)=>{
        this.levelMusic.pause()
        this.setAudioClip(this.levelMusic,src);
        this.levelMusic.loop=true;
        this.levelMusic.volume=0.5;
        this.levelMusic.play();
    }
    
    changeScene = (id) =>{
        this.sceneID=id;
    }
    
    loadNewScene = (id)=>{
        this.audioController.pause();
        document.removeEventListener('keydown',this.mainEvent);
        this.levelMusic.pause();
        this.changeScene(id);
        this.resetLevel();
    }
   
    resetCurrentScene = ()=>{
        if(!this.level.static){
        this.assignMainEvent(()=>{});
        this.score =0;
        this.deaths=0;
        this.objects = [];
        this.UIElements = []
        this.LevelUIElements = [];
        this.loadAudio();
        this.level = LOAD_LEVEL(this,this.sceneID);
        this.assignEventsListeners();
        this.playerTemplate = {name:"Player",x:this.level.playerStartPos.x,y:this.level.playerStartPos.y,src:'player_sheet.png',w:50};
        this.actualCharacter = this.createNewPlayer();
        this.background = new Image();
        this.background.src=this.level.bg;
        this.objects.push(...this.level.objects);
        this.loadLevelUI();
        this.LevelUIElements.push(...this.level.UI);
        this.level.onLoad();
        requestAnimationFrame(this.Update);
        }
    }
    
    keyDown = (e)=>{
        if (this.actualCharacter.isControllable) {
            if(e.repeat){return;}
            if(e.deafaultPrevented){return;}
            switch(e.code){
                case "ArrowLeft":
                    this.actualCharacter.velocity.x = -1;
                    this.actualCharacter.setLeftSprite();
                    this.actualCharacter.changeSpriteIDLeft();
                break;
                case "ArrowRight":
                    this.actualCharacter.velocity.x = 1;
                    this.actualCharacter.changeSpriteIDRight();
                    break;
                case "Space":
                    if (this.actualCharacter.canJump) {
                        this.jumpSound.play();
                        this.actualCharacter.velocity.y = -this.actualCharacter.JUMP;
                        this.actualCharacter.canJump = false;
                        this.actualCharacter.onGround = false;
                    }
                    break;
            }
        }
    }
    
    keyUp = (e) => {
        if (this.actualCharacter.isControllable) {
            if (e.code == 'ArrowRight' || e.code == 'ArrowLeft') {
                this.actualCharacter.velocity.x = 0;
                this.actualCharacter.setSideSprite();
            }
        }
        if(!this.level.static){
            if(e.code=='KeyR'){
                this.resetCurrentScene();
            }
        }
    }
    
    assignEventsListeners = () =>{
        document.addEventListener('keydown',this.mainEvent);
        document.addEventListener('keydown', this.keyDown);
        document.addEventListener('keyup',this.keyUp);
        document.addEventListener('keyup', this.replace);
    }
    
    createNewPlayer = ()=>{
        return new Character(this.playerTemplate.name.toString(), this.level.playerStartPos.x, this.level.playerStartPos.y, this.playerTemplate.src,this.playerTemplate.w);
    }
   
    replace = (e) => {
        if (e.code == 'KeyC') {
            this.killActualCharacter();
        }
    }
   
    killActualCharacter = (leaveBody=true) =>{
        
            this.deathSound.play();
            
            document.removeEventListener('keydown', this.actualCharacter.keyDown);
            
            document.removeEventListener('keyup',this.actualCharacter.keyUp);
            
            this.actualCharacter.disableControls();
            
            this.deaths+=1;
            
            this.UIDeathText.setText(this.deaths.toString());
            if(!leaveBody){
                this.actualCharacter.setPosition(this.level.playerStartPos.x,this.level.playerStartPos.y);
            }
            
            this.actualCharacter.velocity.x=0;
            let actual = this.actualCharacter;
            
            let newPlayer = this.createNewPlayer();
            this.actualCharacter = newPlayer;
            if(leaveBody){
                this.objects.push(actual);
            }
            document.addEventListener('keydown', this.actualCharacter.keyDown);
            document.addEventListener('keyup',this.actualCharacter.keyUp);
    }
   
    Update = () => {
        requestAnimationFrame(this.Update);
        
        const msNow = window.performance.now();
        const msPassed=msNow-msPrev;
        if(msPassed<msPerFrame)return;
        const excessTime = msPassed % msPerFrame;
        msPrev = msNow-excessTime;
        
        this.clearCanvas();
        
        this.ctx.drawImage(this.background,0,0,this.canvas.width,this.canvas.height);
        
        if(!this.level.static){
            this.actualCharacter.drawObject(this.ctx);
            this.detectCollisions();
            this.drawUIElements();
        }
        this.drawObjects();
        this.drawLevelUIElements();
    }

    clearCanvas = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
   
    drawUIElements = () =>{
        this.UIElements.forEach(e=>{
            e.drawObject(this.ctx);
        })
    }
   
    drawLevelUIElements = () =>{
        this.LevelUIElements.forEach(e=>{
            e.drawObject(this.ctx);
        })
    }
   
    drawObjects = () => {
        this.objects.forEach(e => {
            e.drawObject(this.ctx);
        });
    }
   
    detectCollisions = () =>{
        this.objects.forEach(e => {
            if(!(e instanceof Trigger)&&!(e instanceof TriggerRect)){
                this.actualCharacter.detectCollision(e);
            }
            else{
                    e.onTrigger(this.actualCharacter);
            }
            this.objects.forEach(obj=>{
                if(obj!=e){
                    if(obj instanceof Trigger || obj instanceof TriggerRect){
                        obj.onTrigger(e);
                        obj.onTrigger(this.actualCharacter);
                    }
                    else if(obj instanceof RigidBody){
                        obj.detectCollision(e);
                    }
                    else if(obj instanceof Character){
                        obj.detectCollision(e);
                    }
                }
            })
        });
    }

}

window.onload = () => {

    game.init();
}

let game = new Game();


class GameObject {
    
    constructor(name, x = 0, y = 0) {
        this.name = name;
        this.x = x;
        this.y = y;
    }
    
    setName = (name) => {
        this.name = name;
    }
    
    getName = () => {
        return this.name;
    }
    
    setX = (x) => {
        this.x = x;
    }
    
    getX = () => {
        return this.x;
    }
    
    setY = (y) => {
        this.y = y;
    }
    
    getY = () => {
        return this.y;
    }

    
    setPosition = (x, y) => {
        this.setX(x);
        this.setY(y);
    }
    
    
    getPosition = () =>{
        return {x:this.getX(),y:this.getY()};
    }
}


class ImageObject extends GameObject {
    
    constructor(name, x = 0, y = 0, src = 'empty.png', width) {
        super(name, x, y);
        
        this.collidable = true;
        
        this.isVisible = true;
        
        this.sprite = new Image();

        
        if (src == '') {
            src = 'empty.png';
        }

        
        this.setSprite(src);
        
        this.sprite.onload = () => {
            
            this.width = width || this.sprite.width;
            
            this.height = this.sprite.height;
        };
        this.height = this.sprite.height;
        if(width==0){
            this.width=this.sprite.width;
        }
        else{
            this.width=width;
        }
    }
    
    changeVisibility = (state) => {
        this.isVisible = state;
    }

    
    setCollidable = (state) => {
        this.collidable = state;
    }

    
    
    disableObject = () => {
        this.isVisible = false
        this.collidable = false;
    }
    
    
    enableObject = () => {
        this.isVisible = true;
        this.collidable = true;
    }

    
    setSprite = (src) => {
        this.sprite.src = `imgs/${src}`;
    }
    
    getSprite = () => {
        return this.sprite;
    }

    
    
    
    drawObject = (ctx) => {
        if (this.isVisible) {
            ctx.drawImage(this.getSprite(), this.getX(), this.getY());
        }
    }

    
    drawObjectSheetElement = (ctx, id) => {
        if (this.isVisible) {
            ctx.drawImage(this.getSprite(), id * this.width, 0, this.width, this.height, this.getX(), this.getY(), this.width, this.height);
        }
    }
}


class ConstObject extends ImageObject {
    
    constructor(name, x, y, src, dx, dy, visible = true) {
        super(name, x, y, src);
        
        this.dx = dx;
        
        this.dy = dy;
        this.sprite.onload = () => {
            this.width = this.dx;
            this.height = this.dy;
        };
        this.width = this.dx;
        this.height = this.dy;
        this.isVisible = visible;
    }

    
    setdX = (dx)=>{
        this.dx=dx;
        this.width=dx;
    }
    
    getdX = ()=>{
        return this.dx;
    }
    
    setdY = (dy)=>{
        this.dy=dy;
        this.height=dy;
    }
    
    getdY = () =>{
        return this.dy;
    }
    
    resizeObject = (dx,dy)=>{
        this.dx=dx;
        this.dy=dy;
        this.width=dx;
        this.height=dy;
    }

    
    drawObject = (ctx) => {
        if (this.isVisible) {
            ctx.drawImage(this.getSprite(), this.getX(), this.getY(), this.dx, this.dy);
        }
    }
}



class Trigger extends ImageObject {
    
    
    
    constructor(name, x = 0, y = 0, src = 'trigger.png', width = 0, onEnter, show = false, detectName = 'Player') {
        super(name, x, y, src,width);
        if (src == '') {
            src = 'trigger.png';
        }
        
        this.isTriggered = false;
        
        this.triggerEnter = onEnter;
        this.isVisible = show;
        
        this.detectName = detectName;
        
        this.triggerable=true;
    }

    
    setDetectName = (name) => {
        this.detectName = name;
    }
    
    getDetectName = () => {
        return this.detectName;
    }
    
    disableObject = () => {
        this.collidable = false;
        this.triggerable = false;
    }
    
    enableObject = () => {
        this.collidable = true;
        this.triggerable = true;
    }

    
    setOnTriggerEnterEvent = (func) => {
        this.triggerEnter = func;
    }

    
    onTrigger = (obj) => {
        
        if (this.triggerable) {
            
            if (!(obj instanceof ConstObject) || !(obj instanceof GameObjectRect)) {
                if (this.isInTrigger(obj)) {
                    this.triggerEnter();
                }
            }
        }
    }

    
    isInTrigger = (obj) => {
        if (obj.name == this.detectName) {
            return this.checkCollisionWith(obj);
        }
        else {
            return false;
        }
    }
    
    checkCollisionWith = (obj2) => {
        if (this.collidable) {
            const collisionX = this.x < obj2.x + obj2.width && this.x + this.width > obj2.x;
            const collisionY = this.y < obj2.y + obj2.height && this.y + this.height > obj2.y;
            return collisionX && collisionY;
        }
    }
}



class Item extends Trigger {
    constructor(name, x, y, src = 'trigger.png', width = 0, onEnter) {
        super(name, x, y, src, width, onEnter, () => { });
    }
    onTrigger = (obj) => {
        if (this.isInTrigger(obj)) {
            this.triggerEnter();
            this.isTriggered = true;
            this.isVisible = false;
            this.collidable = false;
            this.show = false;
        }
    }
}


class Character extends ImageObject {
    constructor(name, x = 0, y = 0, src = 'empty.png', width = 0) {
        super(name, x, y, src, width);
        
        this.speed = 9.5;
        
        this.isControllable = true;
        
        this.velocity = { x: 0, y: 0 };
        
        this.gravity = GRAVITY;
        
        this.JUMP = 18;
        
        this.canJump = false;
        
        this.onGround = false;
        
        this.spriteID = 0;
        
        this.frames = this.sprite.width / width;
        
        this.lFrames = 4;
        
        this.rFrames = 4;
    }

    setVelocity = (forceX,forceY)=>{
        this.velocity = {x:forceX,y:forceY};
    }

    setVelocityX = (x)=>{
        this.velocity.x=x;
    }
    setVelocityY = (y)=>{
        this.velocity.y=y;
    }
    getVelocity = ()=>{
        return this.velocity;
    }

    
    changeSpriteID = () => {
        this.spriteID += 1;
        if (this.spriteID >= this.frames) {
            this.spriteID = this.frames - 1;
        }
    }

    
    changeSpriteIDLeft = () => {
        this.spriteID += 1;
        if (this.spriteID >= this.frames - this.lFrames) {
            this.spriteID = this.frames;
        }
    }
    
    changeSpriteIDRight = () => {
        this.spriteID += 1;
        if (this.spriteID >= this.rFrames) {
            this.spriteID = 3;
        }
    }

    
    setLeftSprite = () => {
        this.spriteID = 5;
    }

    
    setSideSprite = () => {
        if (this.spriteID >= this.frames / 2) {
            this.spriteID = 4;
        }
        else {
            this.spriteID = 0;
        }
    }
    
    setDieFrame = () => {
        this.spriteID = this.frames - 4;
    }
    
    playDie = () => {
        this.spriteID += 1;
        if (this.spriteID >= this.frames) {
            this.spriteID = this.frames - 1;
            clearInterval(this.dieInteval);
        }
    }

    
    
    updatePosition = () => {
        let newX = this.x + this.velocity.x * this.speed;
        if (!this.checkSideCollisions(newX)) {
            this.x = newX;
        } else {
            this.velocity.x = 0;
        }

        if (!this.onGround) {
            this.velocity.y += this.gravity;
        }
        let newY = this.y + this.velocity.y;
        if (!this.checkTopBottomCollisions(newY)) {
            this.y = newY;
        } else {
            if (this.velocity.y > 0) {
                this.onGround = true;
                this.canJump = true;
            }
            this.velocity.y = 0;
        }
    }

    
    
    drawObject = (ctx) => {
        this.updatePosition();
        this.drawObjectSheetElement(ctx, this.spriteID);
    }

    
    
    disableControls = () => {
        this.setDieFrame();
        this.setName('PlayerCorpse');
        this.dieInteval = setInterval(this.playDie, 100);
        this.isControllable = false;
    }
   
    checkCollisionWith = (obj2) => {
        if (this.collidable) {
            const collisionX = this.x < obj2.x + obj2.width && this.x + this.width > obj2.x;
            const collisionY = this.y < obj2.y + obj2.height && this.y + this.height > obj2.y;
            return collisionX && collisionY;
        }
    }
   
    checkSideCollisions = (x) => {
        for (let obj of game.objects) {
            if (obj.collidable) {
                if (obj != this && !(obj instanceof Trigger) && !(obj instanceof TriggerRect) && this.checkSideCollider(obj, x)) {
                    return true;
                }
            }
        }
        return false;
    }
   
    checkTopBottomCollisions = (y) => {
        for (let obj of game.objects) {
            if (obj.collidable) {
                if (obj != this && !(obj instanceof Trigger) && !(obj instanceof TriggerRect) && this.checkTopBottomCollider(obj, y)) {
                    return true;
                }
            }
        }
        return false;
    }

    
    checkSideCollider = (obj, offsetX) => {
        const collisionX = offsetX < obj.x + obj.width && offsetX + this.width > obj.x;
        const collisionY = this.y < obj.y + obj.height && this.y + this.height > obj.y;
        return collisionX && collisionY;
    }
    
    checkTopBottomCollider = (obj, offsetY) => {
        const collisionX = this.x < obj.x + obj.width && this.x + this.width > obj.x;
        const collisionY = offsetY < obj.y + obj.height && offsetY + this.height > obj.y;
        return collisionX && collisionY;
    }

    
    
   
    detectCollision = (obj) => {
        if (obj.collidable) {
            if (this.checkCollisionWith(obj)) {
                this.velocity.y = 0;
                this.canJump = true;
                this.onGround = true;
            } else if (!this.checkTopBottomCollisions(this.y + 1)) {
                this.gravity = GRAVITY;
                this.canJump = false;
                this.onGround = false;
            }
        }
    }
}