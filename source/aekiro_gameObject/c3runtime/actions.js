"use strict";

{
    const C3 = self.C3;
    
    C3.Behaviors.aekiro_gameobject.Acts = {
        Clone(layer,x,y,name,parentName){
            var template = this.getTemplate();
            var inst = globalThis.aekiro_goManager.clone(template,name,parentName,layer,x,y);
            inst.GetUnsavedDataMap().aekiro_gameobject.updateZindex();
            //this.cloneUID = inst.uid;
        },
        SetName(name){
            this.setName(name);
        },
        AddChildrenFromLayer(layer){
            this.children_addFromLayer(layer);
        },
        AddChildrenFromType(type){
            this.children_addFromType(type);
        }
        ,
        AddChildByName(name){
            this.children_add(name);
        },
        RemoveChildByName(name){
            this.children_remove(name);	
        },
        RemoveChildByType(type){
            this.children_removeFromType(type);
        },
        RemoveFromParent(){
            this.removeFromParent();
        },
        RemoveAllchildren(){
            this.removeAllChildren();
        },


        
        SetOpacity(v){
            this.applyActionToHierarchy(this.acts.SetOpacity,v);
        },
        
        SetVisible(v){
            this.applyActionToHierarchy(this.acts.SetVisible,v);
        },
        
        SetColor(v){		
            this.applyActionToHierarchy(this.acts.SetDefaultColor,v);
        },
        
        SetMirrored(v){		
            this.applyActionToHierarchy(this.acts.SetMirrored,v);
        },
        
        SetFlipped(v){		
            this.applyActionToHierarchy(this.acts.SetFlipped,v);
        },
        MoveToLayer(v){
            this.applyActionToHierarchy(this.acts.MoveToLayer,v);
        },
        MoveToTop(){
            this.moveToTop();
        },
        MoveToBottom(){
            this.moveToBottom();
        },
        SetZElevation(v){
            this.applyActionToHierarchy(this.acts.SetZElevation,v);
        },
        SetEffect(v){
            this.SetBlendMode(v);
        },
        SetWidth(v){
            this.wi.SetWidth(v,true);
            this.wi.SetBboxChanged();
        },
        SetHeight(v){
            this.wi.SetHeight(v,true);
            this.wi.SetBboxChanged();
        },
        Destroy(){
            this.destroyHierarchy();
        },
        SetLocalX(v){
            this.wi.SetX(v,true);
            this.wi.SetBboxChanged();
        },
        SetLocalY(v){
            this.wi.SetY(v,true);
            this.wi.SetBboxChanged();
        },
        SetLocalAngle(v){
            this.wi.SetAngle(v,true);
            this.wi.SetBboxChanged();
        }
    };
    
}	
