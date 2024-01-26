"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_scrollView.Instance = class aekiro_scrollViewInstance extends C3.SDKBehaviorInstanceBase {
		constructor(behInst, properties)
		{
			super(behInst);
			this.proui = this.GetRuntime().GetSingleGlobalObjectClassByCtor(C3.Plugins.aekiro_proui);
			if(this.proui){
				this.proui = this.proui.GetSingleGlobalInstance().GetSdkInstance();
			}
			//**************************
			this._SetVisible = this.GetObjectInstance().GetPlugin().constructor.Acts.SetVisible;
			this.runtime = this.GetRuntime();
			this.aekiro_scrollViewManager = globalThis.aekiro_scrollViewManager;
			this.aekiro_scrollViewManager.add(this.GetObjectInstance());
			this.aekiro_dialogManager = globalThis.aekiro_dialogManager;
			this.goManager = globalThis.aekiro_goManager;
			this.GetObjectInstance().GetUnsavedDataMap().aekiro_scrollView = this;
			this.inst = this.GetObjectInstance();
			this.wi = this.GetWorldInfo();
			//properties
			if (properties){
				//properties
				this.isEnabled = properties[0];
				this.direction = properties[1];
				this.isSwipeScrollEnabled = properties[2];
				this.isMouseScroll = properties[3];
				this.inertia = properties[4];
				this.movement = properties[5]; //0:clamped; 1:elastic		
				this.contentUID = properties[6];
				this.vSliderUID = properties[7];
				this.vScrollBarUID = properties[8];
				this.hSliderUID = properties[9];
				this.hScrollBarUID = properties[10];		
				this.mouseWheelScrollSpeed = properties[11];
			}
			
			if(!this.inertia){ //If there's no inertia, then the movement can't be elastic.
				this.movement = 0;
			}
	
			this.elasticF = 1;
			if(this.movement){
				this.elasticF = 0.4;
			}
	
			//*********************************
			this.onTouchStarted = false;
			this.isTouchMoving = false;
			this.onSliderTouchStarted = false;
			this.onvSliderTouchStarted = false;
			this.onhSliderTouchStarted = false;
	
			this.content = null;
			this.vSlider = null;
			this.vScrollBar = null;
			this.hSlider = null;
			this.hScrollBar = null;
	
			this.isInit = false;
			this.isContentScrollableV = true;
			this.isContentScrollableH = true;
	
			this.scroll = {
				isIdle:true,
				offsetX:0,
				offestY:0,
				scrollRatio:0,
				
				decelerationVelocityX:0,
				decelerationVelocityY:0,
				scrollToTargetY:null,
				scrollToTargetX:null,
				scrollToX:false,
				scrollToY:false,
				scrollToSmooth : 0.3
			};
	
			//********************

	
			this.goManager.eventManager.on("childrenRegistred",() => {
				this.init();
			},{"once":true});
			
			
			this.SetForceOwnTextureListener = this.goManager.eventManager.on("childrenRegistred",() => {
				this.wi.GetLayer().SetForceOwnTexture(true);
			});
			

			
		}
	
	
	
		
		init(){
			if(this.isInit){
				return;
			}
			this.isVScrollEnabled = (this.direction == 0) || (this.direction == 2);
			this.isHScrollEnabled = (this.direction == 1) || (this.direction == 2);

			this.prevSelfLayerVisible = this.wi.GetLayer().IsVisible();
			
			try{
				this.vSlider = this.getPart(this.vSliderUID,"vertical slider");
				this.vScrollBar = this.getPart(this.vScrollBarUID,"vertical scrollbar");
				this.hSlider = this.getPart(this.hSliderUID,"horizontal slider");
				this.hScrollBar = this.getPart(this.hScrollBarUID,"horizontal scrollbar");

				this.content = this.getPart(this.contentUID,"content",true);	
				var contentWi = this.content.GetWorldInfo();
				this.contentWi = this.content.GetWorldInfo();			
			}catch(e){
				console.error(e)
				this.isEnabled = false;
				return;
			}
			

	
			//listening for content size changes
			this.content.GetUnsavedDataMap().aekiro_scrollView = this;
			this.contentWi.SetHeight_old2 = this.contentWi.SetHeight;
			this.contentWi.SetHeight = function (v,onlyNode){
				this.SetHeight_old2(v,onlyNode);
				this.GetInstance().GetUnsavedDataMap().aekiro_scrollView.OnSizeChanged();
			};
			this.contentWi.SetWidth_old2 = this.contentWi.SetWidth;
			this.contentWi.SetWidth = function (v,onlyNode){
				this.SetWidth_old2(v,onlyNode);
				this.GetInstance().GetUnsavedDataMap().aekiro_scrollView.OnSizeChanged();
			};
	
			//new items should have the right blend mode
			this.content.GetUnsavedDataMap().aekiro_gameobject.eventManager.on("childrenAdded",function(inst){
				if(inst){
					//inst.GetUnsavedDataMap().aekiro_gameobject.SetBlendMode(9);	
					inst.GetUnsavedDataMap().aekiro_gameobject.applyActionToHierarchy(inst.GetUnsavedDataMap().aekiro_gameobject.acts.SetEffect,9);
				}
			});
	
	
			//Scrolling is deactivated if the content is too small to scroll
			if(contentWi.GetHeight(true)<=this.wi.GetHeight(true)){
				this.isContentScrollableV = false;
			}
	
			if(contentWi.GetWidth(true)<=this.wi.GetWidth(true)){
				this.isContentScrollableH = false;
			}
	
			//snap the content to the top-left of the scrollview
			contentWi.SetX(this.wi.GetBoundingBox().getLeft() + (contentWi.GetX() - contentWi.GetBoundingBox().getLeft()));
			contentWi.SetY(this.wi.GetBoundingBox().getTop()  + (contentWi.GetY() - contentWi.GetBoundingBox().getTop()));
			contentWi.SetBboxChanged();
	
			//Masking the content
			this.wi.GetLayer().SetForceOwnTexture(true);
			this.GetRuntime().UpdateRender();
				
			//this.content.GetUnsavedDataMap().aekiro_gameobject.SetBlendMode(9);	
			this.content.GetUnsavedDataMap().aekiro_gameobject.applyActionToHierarchy(this.content.GetUnsavedDataMap().aekiro_gameobject.acts.SetEffect,9);
	
			//snap the hSlider to the left of the hScrollBar (user is left to manually place hslider verticaly)
			if(this.hSlider && this.hScrollBar){
				this.hSliderWi = this.hSlider.GetWorldInfo();
				this.hScrollBarWi = this.hScrollBar.GetWorldInfo();
				
				var x = this.hScrollBarWi.GetBoundingBox().getLeft()+(this.hSliderWi.GetX()-this.hSliderWi.GetBoundingBox().getLeft());
				this.hSliderWi.SetX(x);
				this.hSliderWi.SetBboxChanged();
	
				this.hScrollBar.GetSdkInstance().CallAction(this.hScrollBar.GetPlugin().constructor.Acts.MoveToTop);
				this.hSlider.GetSdkInstance().CallAction(this.hSlider.GetPlugin().constructor.Acts.MoveToTop);
			}
	
			//snap the vSlider to the left of the vScrollBar (user is left to manually place vslider horizontaly)
			if(this.vSlider && this.vScrollBar){
				this.vSliderWi = this.vSlider.GetWorldInfo();
				this.vScrollBarWi = this.vScrollBar.GetWorldInfo();
				
				var y = this.vScrollBarWi.GetBoundingBox().getTop()+(this.vSliderWi.GetY()-this.vSliderWi.GetBoundingBox().getTop());
				this.vSliderWi.SetY(y);
				this.vSliderWi.SetBboxChanged();
	
				this.vScrollBar.GetSdkInstance().CallAction(this.vScrollBar.GetPlugin().constructor.Acts.MoveToTop);
				this.vSlider.GetSdkInstance().CallAction(this.vSlider.GetPlugin().constructor.Acts.MoveToTop);
			}
			
			//console.log("init scrollView");
			this.isInit = true;
			
			this._StartTicking();
		}
		

		
		getPart(name,errorLabel,isRequired){
			if(!name && !isRequired)return;
			
			var invalidName = false;
			
			var p = this.goManager.gos[name];
			if(p){
				if(!this.proui.isTypeValid(p,[C3.Plugins.Sprite,C3.Plugins.NinePatch,C3.Plugins.TiledBg])){
					throw new Error("ProUI-ScrollView-UID = "+this.GetObjectInstance().GetUID()+" : The "+errorLabel+" of the scrollView can only be a Sprite, TiledBackground Or 9-patch object.");
				}
				return p;
			}else{
				invalidName = true;
			}		
			
			if(!name && isRequired){
				invalidName = true;
			}

			if(invalidName){
				throw new Error("ProUI-ScrollView: "+errorLabel+" not found, please check its name");
			}
			
			return;
		}
		
		PostCreate(){
			this.sdkInstance_callAction = this.GetObjectInstance().GetSdkInstance().CallAction;
			this.sdkInstance_acts = this.GetObjectInstance().GetPlugin().constructor.Acts;
			//this.init();
		}
		
		OnMouseWheel(x,y,deltaY){
			if(this.isEnabled && this.isVScrollEnabled && this.isContentScrollableV && this.isMouseScroll
			&& this.isInteractible(x,y) && this.wi.ContainsPoint(x,y)){
				this.scroll.scrollToX = false;
				this.scroll.scrollToY = false;
				this.scroll.isIdle = false;
				this._StartTicking();
				this.onWheelStarted = true;
				var dir = (deltaY > 0 ? -1 : 1);
				
				if(this.inertia){
					//this.scroll.decelerationVelocityY = dir*1*this.contentWi.GetHeight(true);
					this.scroll.decelerationVelocityY = dir*650*this.mouseWheelScrollSpeed;
					

				}else{
					this.contentWi.OffsetY(30*dir*this.mouseWheelScrollSpeed);
				}
				
				this.scroll.decelerationVelocityX = 0;
				//console.log("mouse wheel");
			}
		}
		
		isInteractible(x,y){
			if(this.proui.ignoreInput){
				return false;
			}
			
			var isUnder = false;
			if(this.aekiro_dialogManager){
				isUnder = this.aekiro_dialogManager.isInstanceUnderModal(this.wi.GetLayer().GetIndex());
			}
			
			//not interactible if there's a scrollview on top
			var isOverlaped = this.aekiro_scrollViewManager.isOverlaped(this.GetObjectInstance(),x,y);
	
			//console.log(isUnder,isOverlaped);
			return !isUnder && !isOverlaped;
		}
		
		OnAnyInputDown(x, y){
			if(!this.isEnabled || !this.isInteractible(x,y)){
				return;
			}
			//console.log("_OnInputDown"+x+"***"+y+"***"+source);		
			if (this.wi.ContainsPoint(x, y)){
				this.OnInputDown(x,y);
			}
			
			if(this.vSlider && this.vScrollBar && this.isVScrollEnabled && this.isContentScrollableV && this.vSliderWi.ContainsPoint(x,y)){
				this.OnSliderTouchStart("v",x,y);
			}
	
			if(this.hSlider && this.hScrollBar && this.isHScrollEnabled && this.isContentScrollableH && this.hSliderWi.ContainsPoint(x,y)){
				this.OnSliderTouchStart("h",x,y);
			}
		}
	
		OnInputDown(x, y) {
			if(!this.isEnabled || !this.isSwipeScrollEnabled){
				return;
			}
	
			this.onTouchStarted = true;
			this.scroll.startTime = Date.now();
			//console.log(x,y);
			if(this.isVScrollEnabled && this.isContentScrollableV){
				this.scroll.offsetY = y - this.contentWi.GetY();
				this.scroll.touchStartY = y;
	
				this.scroll.isIdle = false;
				this._StartTicking();
				this.scroll.scrollToX = false;
				this.scroll.scrollToY = false;
			}
			
			if(this.isHScrollEnabled && this.isContentScrollableH){
				this.scroll.offsetX = x - this.contentWi.GetX();
				this.scroll.touchStartX = x;
				
				this.scroll.isIdle = false;
				this._StartTicking();
				this.scroll.scrollToX = false;
				this.scroll.scrollToY = false;
			}
	
			this.touchX = x;
			this.touchY = y;
			
			this.scroll.decelerationVelocityX = 0;
			this.scroll.decelerationVelocityY = 0;
		}
		
		OnSliderTouchStart(type,x,y){
			if(type=="v"){
				this.scroll.offsetY = y - this.vSliderWi.GetY();
				this.onvSliderTouchStarted = true;
			}else{
				this.scroll.offsetX = x - this.hSliderWi.GetX();
				this.onhSliderTouchStarted = true;
			}
	
			this.onSliderTouchStarted = true;
			this.scroll.isIdle = true;
			this._StopTicking();
	
			//force content to bound if it's being bounded.
			this.boundContent();
	
			//stop scrollTo
			this.scroll.scrollToX = false;
			this.scroll.scrollToY = false;
	
			//stop Inertia
			this.scroll.decelerationVelocityX = 0;
			this.scroll.decelerationVelocityY = 0;
		}
		
		OnAnyInputUp(x, y) {
			if(!this.isEnabled){
				return;
			}
			
			if(this.onTouchStarted){
				this.OnInputUp(x,y);
			}
			this.onTouchStarted = false;
			this.onSliderTouchStarted = false;
			this.onvSliderTouchStarted = false;
			this.onhSliderTouchStarted = false;
		}
		
		OnInputUp(x, y){
			this.scroll.elapsedTime = (Date.now() - this.scroll.startTime)/1000;
			//console.log(this.scroll.elapsedTime/1000);
			if(this.isSwipeScrollEnabled && this.inertia){
				if(this.isHScrollEnabled && this.isContentScrollableH){
					this.scroll.decelerationVelocityX = (x-this.scroll.touchStartX)/this.scroll.elapsedTime;
					if(Math.abs(this.scroll.decelerationVelocityX)<500){
						this.scroll.decelerationVelocityX = 0;
					}
				}
	
				if(this.isVScrollEnabled && this.isContentScrollableV){
					this.scroll.decelerationVelocityY = (y-this.scroll.touchStartY)/this.scroll.elapsedTime;
					if(Math.abs(this.scroll.decelerationVelocityY)<500){
						this.scroll.decelerationVelocityY = 0;
					}	
				}			
			}
	
			//console.log(this.scroll.decelerationVelocityX,this.scroll.decelerationVelocityY);
			this.isTouchMoving = false;
		}
	
		OnAnyInputMove(x, y,source) {
			if(this.onTouchStarted){
				this.isTouchMoving = true;
				this.touchX = x;
				this.touchY = y;
			}
			
			//VERTICAL SLIDER SCROLLING
			if(this.onvSliderTouchStarted && this.isVScrollEnabled && this.isContentScrollableV){
				var newy = y - this.scroll.offsetY;
				this.vSliderWi.SetY(C3.clamp(newy,this.vScrollBarWi.GetBoundingBox().getTop()+(this.vSliderWi.GetY()-this.vSliderWi.GetBoundingBox().getTop()), this.vScrollBarWi.GetBoundingBox().getBottom()-(this.vSliderWi.GetBoundingBox().getBottom() - this.vSliderWi.GetY())));
				this.vSliderWi.SetBboxChanged();
				
				//scrolling
				this.contentWi.SetY(this.wi.GetBoundingBox().getTop()+(this.contentWi.GetY()-this.contentWi.GetBoundingBox().getTop())-((this.vSliderWi.GetBoundingBox().getTop()-this.vScrollBarWi.GetBoundingBox().getTop())/(this.vScrollBarWi.GetHeight(true)-this.vSliderWi.GetHeight(true)))*(this.contentWi.GetHeight(true)-this.wi.GetHeight(true)));
				this.contentWi.SetBboxChanged();
			}
	
			//HORIZONTAL SLIDER SCROLLING
			if(this.onhSliderTouchStarted && this.isHScrollEnabled && this.isContentScrollableH){
				var newx = x - this.scroll.offsetX;
				this.hSliderWi.SetX(C3.clamp(newx,this.hScrollBarWi.GetBoundingBox().getLeft()+(this.hSliderWi.GetX()-this.hSliderWi.GetBoundingBox().getLeft()) , this.hScrollBarWi.GetBoundingBox().getRight()-(this.hSliderWi.GetBoundingBox().getRight()-this.hSliderWi.GetX())));
				this.hSliderWi.SetBboxChanged();
	
				//scrolling
				this.contentWi.SetX(this.wi.GetBoundingBox().getLeft()+(this.contentWi.GetX()-this.contentWi.GetBoundingBox().getLeft())-((this.hSliderWi.GetBoundingBox().getLeft()-this.hScrollBarWi.GetBoundingBox().getLeft())/(this.hScrollBarWi.GetWidth(true)-this.hSliderWi.GetWidth(true)))*(this.contentWi.GetWidth(true)-this.wi.GetWidth(true)));
				this.contentWi.SetBboxChanged();
			}
		}
	
		boundContent(){
			if(this.contentWi.GetHeight(true)<=this.wi.GetHeight(true)){ //the content is snapped to the top
				this.contentWi.SetY(this.wi.GetBoundingBox().getTop()+(this.contentWi.GetY()-this.contentWi.GetBoundingBox().getTop()));
			}else{
				//checking the vertical boundaries of the content
				var diff_topY = this.contentWi.GetBoundingBox().getTop()-this.wi.GetBoundingBox().getTop();
				var diff_bottomY = this.wi.GetBoundingBox().getBottom()-this.contentWi.GetBoundingBox().getBottom();
				if(diff_topY>0 || diff_bottomY>0){
					this.contentWi.SetY(C3.clamp(this.contentWi.GetY(),this.contentWi.GetY()+diff_bottomY,this.contentWi.GetY() - diff_topY));
				}
			}
			
			if(this.contentWi.GetWidth(true)<=this.wi.GetWidth(true)){//the content is snapped to the left
				this.contentWi.SetX(this.wi.GetBoundingBox().getLeft() + (this.contentWi.GetX() - this.contentWi.GetBoundingBox().getLeft()));
			}else{
				//checking the horizontal boundaries of the content
				var diff_rightX = this.wi.GetBoundingBox().getRight()-this.contentWi.GetBoundingBox().getRight();
				var diff_leftX = this.contentWi.GetBoundingBox().getLeft()-this.wi.GetBoundingBox().getLeft();
				if(diff_rightX>0 || diff_leftX>0){
					this.contentWi.SetX(C3.clamp(this.contentWi.GetX(),this.contentWi.GetX() + diff_rightX,this.contentWi.GetX() - diff_leftX));
				}				
			}
			
			this.contentWi.SetBboxChanged();
		}
		
		boundContentX(elasticF){
			if(this.isHScrollEnabled){
				var isOutOfBound;
				this.contentWi.SetBboxChanged();
				if(this.contentWi.GetWidth(true)<=this.wi.GetWidth(true)){//the content is snapped to the left
					this.contentWi.SetX(this.wi.GetBoundingBox().getLeft() + (this.contentWi.GetX() - this.contentWi.GetBoundingBox().getLeft()));
					isOutOfBound = true;
				}else{
					//checking the horizontal boundaries of the content
					var diff_rightX = this.wi.GetBoundingBox().getRight()-this.contentWi.GetBoundingBox().getRight();
					var diff_leftX = this.contentWi.GetBoundingBox().getLeft()-this.wi.GetBoundingBox().getLeft();
					isOutOfBound = diff_rightX>0 || diff_leftX>0;
	
					if(isOutOfBound){
						if(elasticF && this.elasticF!=1){
							this.contentWi.SetX(C3.clamp(this.contentWi.GetX(),C3.lerp(this.contentWi.GetX(),this.contentWi.GetX() + diff_rightX,this.elasticF),C3.lerp(this.contentWi.GetX(),this.contentWi.GetX() - diff_leftX,this.elasticF)));
						}else{
							this.contentWi.SetX(C3.clamp(this.contentWi.GetX(),this.contentWi.GetX() + diff_rightX,this.contentWi.GetX() - diff_leftX));
						}
					}
				}
				this.contentWi.SetBboxChanged();
				return isOutOfBound;
			}
		}
	
		boundContentY(elasticF){
			if(this.isVScrollEnabled){
				var isOutOfBound;
				this.contentWi.SetBboxChanged();
				if(this.contentWi.GetHeight(true)<=this.wi.GetHeight(true)){
					this.contentWi.SetY(this.wi.GetBoundingBox().getTop() + (this.contentWi.GetY() - this.contentWi.GetBoundingBox().getTop())); //the content is snapped to the top
					isOutOfBound = true;
				}else{
					//checking the horizontal boundaries of the content
					var diff_topY = this.contentWi.GetBoundingBox().getTop()-this.wi.GetBoundingBox().getTop();
					var diff_bottomY = this.wi.GetBoundingBox().getBottom()-this.contentWi.GetBoundingBox().getBottom();
					isOutOfBound = diff_topY>0 || diff_bottomY>0;
	
					if(isOutOfBound){
						if(elasticF && this.elasticF!=1){
							this.contentWi.SetY(C3.clamp(this.contentWi.GetY(),C3.lerp(this.contentWi.GetY(),this.contentWi.GetY() + diff_bottomY,this.elasticF),C3.lerp(this.contentWi.GetY(),this.contentWi.GetY() - diff_topY,this.elasticF)));
						}else{
							this.contentWi.SetY(C3.clamp(this.contentWi.GetY(),this.contentWi.GetY() + diff_bottomY,this.contentWi.GetY() - diff_topY));
						}
					}
				}
				this.contentWi.SetBboxChanged();
				return isOutOfBound;
			}
		}
	
		scrollTo(targetX,targetY,targetType,smooth){
			if(!this.isEnabled)return;
	
			this.scroll.scrollToSmooth = smooth;
			this.scroll.scrollToTargetY = null;
			this.scroll.scrollToTargetX = null;
			this.scroll.scrollToX = false;
			this.scroll.scrollToY = false;
			this.onScrollToStarted = false;
			
			
			if(this.isVScrollEnabled && this.isContentScrollableV ){
				
				var viewportCenterY = (this.wi.GetBoundingBox().getTop() + this.wi.GetBoundingBox().getBottom())/2;
				if(targetType){//Percentage
					targetY = C3.clamp(targetY,0,1);
					targetY = this.contentWi.GetBoundingBox().getTop() + targetY*this.contentWi.GetHeight(true);
				}
				this.scroll.scrollToTargetY = this.contentWi.GetY() + (viewportCenterY-targetY);
				this.scroll.scrollToY = true;
				this.scroll.isIdle = false;
				this._StartTicking();
				this.onScrollToStarted = true;
			}
	
			
			if(this.isHScrollEnabled && this.isContentScrollableH){
				var viewportCenterX = (this.wi.GetBoundingBox().getLeft() + this.wi.GetBoundingBox().getRight())/2;
				if(targetType){//Percentage
					targetX = C3.clamp(targetX,0,1);
					targetX = this.contentWi.GetBoundingBox().getLeft() + targetX*this.contentWi.GetWidth(true);
				}
				this.scroll.scrollToTargetX = this.contentWi.GetX() + (viewportCenterX-targetX);
				this.scroll.scrollToX = true;
				this.scroll.isIdle = false;
				this._StartTicking();
				this.onScrollToStarted = true;
			}
			
			this.contentWi.SetBboxChanged();
		}

		scrollBy(distanceX,distanceY,targetType,smooth){
			if(!this.isEnabled)return;
	
			this.scroll.scrollToSmooth = smooth;
			this.scroll.scrollToTargetY = null;
			this.scroll.scrollToTargetX = null;
			this.scroll.scrollToX = false;
			this.scroll.scrollToY = false;
			this.onScrollToStarted = false;
			
			this.boundContent();

			if(this.isVScrollEnabled && this.isContentScrollableV){
				if(targetType){//Percentage
					distanceY = C3.clamp(distanceY,-1,1);
					distanceY = distanceY*this.contentWi.GetHeight(true);

				}
				this.scroll.scrollToTargetY = this.contentWi.GetY() - distanceY;
				this.scroll.scrollToY = true;
				this.scroll.isIdle = false;
				this._StartTicking();
				this.onScrollToStarted = true;
			}

			if(this.isHScrollEnabled && this.isContentScrollableH){
				if(targetType){//Percentage
					distanceX = C3.clamp(distanceX,-1,1);
					distanceX = distanceX*this.contentWi.GetWidth(true);
				}
				this.scroll.scrollToTargetX = this.contentWi.GetX() - distanceX;
				this.scroll.scrollToX = true;
				this.scroll.isIdle = false;
				this._StartTicking();
				this.onScrollToStarted = true;
			}
			
			this.contentWi.SetBboxChanged();	
		}
		
		boundSlider(slider){
			if(slider == "v" && this.vSlider && this.vScrollBar){
				var sy = this.vScrollBarWi.GetBoundingBox().getTop()+(this.vSliderWi.GetY()-this.vSliderWi.GetBoundingBox().getTop())+(this.vScrollBarWi.GetHeight(true)-this.vSliderWi.GetHeight(true))*((this.contentWi.GetBoundingBox().getTop()-this.wi.GetBoundingBox().getTop())/(this.wi.GetHeight(true)-this.contentWi.GetHeight(true)));
				sy = C3.clamp(sy,this.vScrollBarWi.GetBoundingBox().getTop()+(this.vSliderWi.GetY()-this.vSliderWi.GetBoundingBox().getTop()), this.vScrollBarWi.GetBoundingBox().getBottom()-(this.vSliderWi.GetBoundingBox().getBottom() - this.vSliderWi.GetY()));
				this.vSliderWi.SetY(sy);
				this.vSliderWi.SetBboxChanged();
			}
			if(slider == "h" && this.hSlider && this.hScrollBar){
				var sx = this.hScrollBarWi.GetBoundingBox().getLeft()+(this.hSliderWi.GetX()-this.hSliderWi.GetBoundingBox().getLeft())+(this.hScrollBarWi.GetWidth(true)-this.hSliderWi.GetWidth(true))*((this.contentWi.GetBoundingBox().getLeft()-this.wi.GetBoundingBox().getLeft())/(this.wi.GetWidth(true)-this.contentWi.GetWidth(true)));
				sx = C3.clamp(sx,this.hScrollBarWi.GetBoundingBox().getLeft()+(this.hSliderWi.GetX()-this.hSliderWi.GetBoundingBox().getLeft()), this.hScrollBarWi.GetBoundingBox().getRight()-(this.hSliderWi.GetBoundingBox().getRight() - this.hSliderWi.GetX()));
				this.hSliderWi.SetX(sx);
				this.hSliderWi.SetBboxChanged();
			}
		}
		
		postGridviewUpdate(){
			var parts = [this.vScrollBar,this.vSlider,this.hScrollBar,this.hSlider];
	
			for (var i = 0, l= parts.length; i < l; i++) {
				if(parts[i]){
					parts[i].GetSdkInstance().CallAction(parts[i].GetPlugin().constructor.Acts.MoveToTop);
				}
			}
		}
		
		OnSizeChanged(){
			//should be called because the OnSizeChanged is called before SetBboxChanged; and because it's needed in boundContent()
			this.contentWi.SetBboxChanged();
			
			this.boundContent();
			this.boundSlider("v");
			this.boundSlider("h");
			
			this.isContentScrollableV = true;
			this.isContentScrollableH = true;
			//Scrolling is deactivated if the content is too small to scroll
			if(this.contentWi.GetHeight(true)<=this.wi.GetHeight(true)){
				this.isContentScrollableV = false;
			}
	
			if(this.contentWi.GetWidth(true)<=this.wi.GetWidth(true)){
				this.isContentScrollableH = false;
			}
		}
		
		isMoving(){
			//console.log(Math.abs(this.scroll.decelerationVelocityX));
			return this.isTouchMoving; //|| Math.abs(this.scroll.decelerationVelocityX)>1 || Math.abs(this.scroll.decelerationVelocityY)>1;	
		}
		
		Tick(){
			//console.log("tick");
			//console.log(Math.abs(this.scroll.decelerationVelocityY));
			if(this.scroll.isIdle || !this.content || !this.isEnabled){
				this._StopTicking();
				//console.log("Scroll idle");
			}		
			//****************************************
			//SWIPE SCROLLING
			if(this.onTouchStarted && this.isSwipeScrollEnabled && !this.onSliderTouchStarted){ //&& this.isInTouch(this.inst)
				if(this.isHScrollEnabled && this.isContentScrollableH){
					this.contentWi.SetX(this.touchX - this.scroll.offsetX);
				}
				if(this.isVScrollEnabled && this.isContentScrollableV){
					this.contentWi.SetY(this.touchY - this.scroll.offsetY);
				}
				this.contentWi.SetBboxChanged();
			}
	
			//Inertia: used with swipe and wheel scrolling
			if(this.inertia){
				if(this.isHScrollEnabled && Math.abs(this.scroll.decelerationVelocityX) >1){
					this.contentWi.OffsetX(this.scroll.decelerationVelocityX*this.runtime.GetDt(this.content));
					this.scroll.decelerationVelocityX *= 0.95;
					this.contentWi.SetBboxChanged();
				}
	
				if(this.isVScrollEnabled && Math.abs(this.scroll.decelerationVelocityY) >1){
					this.contentWi.OffsetY(this.scroll.decelerationVelocityY*this.runtime.GetDt(this.content));
					this.scroll.decelerationVelocityY *= 0.95;
					this.contentWi.SetBboxChanged();
				}
			}
			
			
			//****************************************
			//SCROLL TO 
			if(this.scroll.scrollToY && this.scroll.scrollToTargetY!=null && 
			this.isVScrollEnabled && this.isContentScrollableV && !this.onSliderTouchStarted){
				this.contentWi.SetY(C3.lerp(this.contentWi.GetY(),this.scroll.scrollToTargetY,this.scroll.scrollToSmooth));
	
				if(this.boundContentY()){ //if the content was bounded then we stop the scrollTo
					this.scroll.scrollToY = false;
					this.boundContentY();
				}else if(Math.abs(this.contentWi.GetY()-this.scroll.scrollToTargetY)<1){ //if we reach the target then we stop the scrollTo
					this.contentWi.SetY(this.scroll.scrollToTargetY);
					this.contentWi.SetBboxChanged();
					this.scroll.scrollToY = false;
				}
			}
	
			if(this.scroll.scrollToX && this.scroll.scrollToTargetX!=null && 
			this.isHScrollEnabled && this.isContentScrollableH && !this.onSliderTouchStarted){
				this.contentWi.SetX(C3.lerp(this.contentWi.GetX(),this.scroll.scrollToTargetX,this.scroll.scrollToSmooth));
				
				if(this.boundContentX()){
					this.scroll.scrollToX = false;
					this.boundContentX();
				}else if(Math.abs(this.contentWi.GetX()-this.scroll.scrollToTargetX)<1){
					this.contentWi.SetX(this.scroll.scrollToTargetX);
					this.contentWi.SetBboxChanged();
					this.scroll.scrollToX = false;				
				}
			}
	
			//Disable the core loop when scrollTo finishes (whether inertia on or off)
			if(this.onScrollToStarted && !this.scroll.scrollToX && !this.scroll.scrollToY){
				this.scroll.isIdle = true;
				this.onScrollToStarted = false;
				//console.log("Scroll TO disabled");
			}
			
			//****************************************
			
			//we position the sliders according to the content's position: (when scrolling by swiping or mousewheel or scrollTo)
			if(this.isVScrollEnabled && this.isContentScrollableV){
				this.boundSlider("v");				
			}
			if(this.isHScrollEnabled && this.isContentScrollableH){
				this.boundSlider("h");
			}
			
			//BOUNDING THE CONTENT (when scrolling by swiping or mousewheel)
			if(this.isVScrollEnabled  && !this.scroll.scrollToY){
				//checking the vertical boundaries of the content
				this.boundContentY(true);
			}
	
			if(this.isHScrollEnabled && !this.scroll.scrollToX){
				//checking the horizontal boundaries of the content
				this.boundContentX(true);
			}
			
			//In case of inertia, disable the core loop when scrolling (swipe or wheel) finishes
			if(!this.onTouchStarted  && Math.abs(this.scroll.decelerationVelocityX)<=1 && Math.abs(this.scroll.decelerationVelocityY)<=1 && !this.scroll.scrollToX && !this.scroll.scrollToY ){
				this.scroll.isIdle = true;
				this.boundContent();
			}
		}
	
		Release(){
			this.aekiro_scrollViewManager.remove(this.GetObjectInstance());
			this.goManager.eventManager.removeListener(this.SetForceOwnTextureListener);
			super.Release();
		}
	
		SaveToJson(){
			return {
				"isEnabled" : this.isEnabled,
				"direction" : this.direction,
				"isSwipeScrollEnabled" : this.isSwipeScrollEnabled,
				"isMouseScroll" : this.isMouseScroll,
				"inertia" : this.inertia,
				"movement" : this.movement,
				"contentUID" : this.contentUID,
				"vSliderUID" : this.vSliderUID,
				"vScrollBarUID" : this.vScrollBarUID,
				"hSliderUID" : this.hSliderUID,
				"hScrollBarUID" : this.hScrollBarUID			
			};
		}
	
		LoadFromJson(o){
			this.isEnabled = o["isEnabled"];
			this.direction = o["direction"];
			this.isSwipeScrollEnabled = o["isSwipeScrollEnabled"];
			this.isMouseScroll = o["isMouseScroll"];
			this.inertia = o["inertia"];
			this.movement = o["movement"];
			this.contentUID = o["contentUID"];
			this.vSliderUID = o["vSliderUID"];
			this.vScrollBarUID = o["vScrollBarUID"];
			this.hSliderUID = o["hSliderUID"];
			this.hScrollBarUID = o["hScrollBarUID"];
		}
	
	};
}
