

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