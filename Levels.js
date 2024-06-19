


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
    let portalOne = Portal(game,{x:game.canvas.width/2-50,y:game.canvas.height-50},{x:40,y:410});
    Scene.objects.push(...portalOne);
    
    
    let redFlagWall = new GameObjectRect('redwall',game.canvas.width-200,0,20,100,'red');
    let alterRed = Alter(350,game.canvas.height-190,'activator_red.png',()=>{
        if(!blockersWallGreen[0].isVisible)
        redFlagWall.disableObject();
    },'PlayerCorpse');
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

    let portalTwo = Portal(game,{x:game.canvas.width-120,y:game.canvas.height-310},{x:0,y:0});
    let AlterBlue = Alter(game.canvas.width-150,game.canvas.height-70,'activator_blue.png',()=>{
        BlueBlockersWalls.forEach(e=>{
            e.disableObject();
        })
    },'PlayerCorpse')

    Scene.objects.push(...portalTwo,AlterBlue.alter,AlterBlue.trigger);
    Scene.objects.push(alterGreen.alter,alterGreen.trigger);
    Scene.objects.push(flag);
    Scene.objects.push(alterRed.alter,alterRed.trigger);
    Scene.objects.push(redFlagWall);
    Scene.objects.push(...BlueBlockersWalls);
    Scene.objects.push(...blockersWallGreen);
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
    let Scene = {bg:'imgs/empty.png',objects:[],UI:[],playerStartPos:{x:-100,y:-100},onLoad:()=>{},static:false,ost:'menu.wav'};
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
    let Scene = {bg:'imgs/bgs/bg1.png',objects:[],UI:[],playerStartPos:{x:100,y:game.canvas.height-120},onLoad:()=>{},static:true,ost:'menu2.wav'};
    
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