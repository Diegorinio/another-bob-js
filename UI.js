

class UIElement extends GameObject{
    constructor(name,x,y){
        super(name,x,y);
        this.isVisible=true
    }
    disableElement = () =>{
        this.isVisible=false;
    }
    enableElement = () =>{
        this.isVisible=true;
    }
}


class UIImage extends UIElement{
    constructor(name,x,y,src,dx,dy){
        super(name,x,y);
        this.dx=dx;
        this.dy=dy;
        this.sprite = new Image();
        if (src == '') {
            src = 'empty.png';
        }
        this.setSprite(src);
        this.width=this.dx;
        this.height = this.dy;
    }

    
    setSprite = (src) => {
        this.sprite.src = `imgs/${src}`;
    }
    
    getSprite = () => {
        return this.sprite;
    }

    drawObject = (ctx) => {
        if(this.isVisible){
            ctx.drawImage(this.getSprite(), this.getX(), this.getY(),this.dx,this.dy);
        }
    }
}




class InteractiveImage extends UIImage{
    constructor(name,x,y,src,dx,dy, onEnter = (e) => {}, onLeave = (e) => {}, onClick = (e) => {}) {
        super(name,x,y,src,dx,dy);
        
        this.onEnter = onEnter;
        
        this.onLeave = onLeave;
        
        this.onClick = onClick;
        
        this.isHovered = false;
        
        this.isClicked = false;
    }

    
    setOnEnterEvent = (f) => {
        this.onEnter = f;
    }
    
    setOnLeaveEvent = (f) => {
        this.onLeave = f;
    }
    
    setOnClickEvent = (f) => {
        this.onClick = f;
    }

    
    setEventListeners = (canvas) => {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            this.findMouse(e, mouseX, mouseY);
        });

        canvas.addEventListener('mousedown', (e) => {
            this.mouseDownHandler(e)
        });

        canvas.addEventListener('mouseup', (e) => {
            this.mouseUpHandler(e);
        });
    }
    
    mouseDownHandler = (e) => {
        if (this.isHovered && !this.isClicked) {
            this.isClicked = true;
            this.onClick(e);
        }
    }
    
    mouseUpHandler = (e) => {
        this.isClicked = false;
    }

    
    isInBorder = (x, y) => {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }

    
    findMouse = (e) => {
        let rect = e.target.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;
        let wasHovered = this.isHovered;
        this.isHovered = this.isInBorder(mouseX, mouseY);

        if (this.isHovered && !wasHovered) {
            this.onEnter(e);
        } else if (!this.isHovered && wasHovered) {
            this.onLeave(e);
        }
    }
}


class UIText extends UIElement{
    constructor(name,x,y,text,fontSize,color,font){
        super(name,x,y);
        
        this.text=text;
        
        this.fontSize=fontSize;
        
        this.font = font || 'arial';
        
        this.color = color ||'black';
    }
    
    setText = (text)=>{
        this.text=text;
    }
    
    getText = () =>{
        return this.text;
    }

    drawObject = (ctx)=>{
        if(this.isVisible){
        ctx.fillStyle=this.color;
        ctx.font = `${this.fontSize}px ${this.font}`;
        ctx.fillText(this.text,this.x,this.y);
        }
    }
}


class PanelRect extends UIElement{
    constructor(name,x,y,width,height,color='white'){
        super(name,x,y);
        this.width=width;
        this.height=height;
        this.color=color;
        this.isVisible = true;
    }

    drawObject = (ctx)=>{
        if(this.isVisible){
            console.log("drwa element");
            ctx.fillStyle=this.color;
            ctx.beginPath();
            ctx.rect(this.x,this.y,this.width,this.height);
            ctx.fill();
        }
    }
}


class InteractiveRect extends PanelRect {
    constructor(name, x, y, width, height, color = 'white', onEnter = (e) => {}, onLeave = (e) => {}, onClick = (e) => {}) {
        super(name, x, y);
        this.width = width;
        this.height = height;
        this.color = color;
        
        this.onEnter = onEnter;
        
        this.onLeave = onLeave;
        
        this.onClick = onClick;
        
        this.isHovered = false;
        
        this.isClicked = false;
    }

    
    setOnEnterEvent = (f) => {
        this.onEnter = f;
    }
    
    setOnLeaveEvent = (f) => {
        this.onLeave = f;
    }
    
    setOnClickEvent = (f) => {
        this.onClick = f;
    }

    
    setEventListeners = (canvas) => {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            this.findMouse(e, mouseX, mouseY);
        });

        canvas.addEventListener('mousedown', (e) => {
            this.mouseDownHandler(e)
        });

        canvas.addEventListener('mouseup', (e) => {
            this.mouseUpHandler(e);
        });
    }
    
    mouseDownHandler = (e) => {
        if (this.isHovered && !this.isClicked) {
            this.isClicked = true;
            this.onClick(e);
        }
    }
    
    mouseUpHandler = (e) => {
        this.isClicked = false;
    }

    
    isInBorder = (x, y) => {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }

    
    findMouse = (e) => {
        let rect = e.target.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;
        let wasHovered = this.isHovered;
        this.isHovered = this.isInBorder(mouseX, mouseY);

        if (this.isHovered && !wasHovered) {
            this.onEnter(e);
        } else if (!this.isHovered && wasHovered) {
            this.onLeave(e);
        }
    }
}
