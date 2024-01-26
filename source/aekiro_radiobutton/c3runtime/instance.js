"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_radiobutton.Instance = class aekiro_radiobuttonInstance extends globalThis.Aekiro.checkbox
	{
		constructor(behInst, properties)
		{
			super(behInst,properties);
			
			//properties
			this.isEnabled = properties[0];
			this.name = properties[1];

			this.frame_normal = properties[2];
			this.frame_hover = properties[3];
			this.frame_disabled = properties[4];
			this.frame_focus = properties[5];
			
			this.clickSound = properties[6];
			this.hoverSound = properties[7];
			this.focusSound = properties[8];

			this.clickAnimation = properties[9];
			this.hoverAnimation = properties[10];
			this.focusAnimation = properties[11];

			this.color_normal = properties[12];
			this.color_hover = properties[13];
			this.color_clicked = properties[14];
			this.color_disabled = properties[15];
			this.color_focus = properties[16];
			
			this.clickAnimationFactor = properties[17];
			this.hoverAnimationFactor = properties[18];
			this.focusAnimationFactor = properties[19];
			
			this.ignoreInput = properties[17];
			
			this.GetObjectInstance().GetUnsavedDataMap().aekiro_radiobutton = this;
			this.checkbox_constructor();
		}
	
	
		init(){
			if(!this.aekiro_gameobject){
				return;	
			}
			
			this.radioGroup  = this.aekiro_gameobject.parent_get();
			
			if(!this.radioGroup){
				console.error("ProUI-Radiobutton uid=%s: Radiogroup not found.",this.inst.GetUID());
				return;
			}
	
			if(!this.radioGroup.GetUnsavedDataMap().aekiro_radiogroup){
				console.error("ProUI-Radiobutton uid=%s: Radiogroup needs to have a Radiogroup behavior.",this.inst.GetUID());
				return;
			}
			
			this.radioGroup = this.radioGroup.GetUnsavedDataMap().aekiro_radiogroup;
		}
		
		GetRadioGroup(){
			var p  = this.aekiro_gameobject.parent_get();
			if(p){
				return p.GetUnsavedDataMap().aekiro_radiogroup;
			}
			return null;
		}

		setEnabled (isEnabled){
			super.setEnabled(isEnabled);
			var radioGroup = this.GetRadioGroup();
			if(isEnabled && radioGroup){
				radioGroup.isEnabled = isEnabled;
			}
		}
	
	
		OnAnyInputUpC(){
			var radioGroup = this.GetRadioGroup();
			if(radioGroup){
				radioGroup.setValue(this.name);
			}
			this.Trigger(C3.Behaviors.aekiro_radiobutton.Cnds.OnClicked);
		}
		
		OnMouseEnterC(){
			this.Trigger(C3.Behaviors.aekiro_radiobutton.Cnds.OnMouseEnter);
		}
		
		OnMouseLeaveC(){
			this.Trigger(C3.Behaviors.aekiro_radiobutton.Cnds.OnMouseLeave);
		}
		
		OnFocusedC(){
			this.Trigger(C3.Behaviors.aekiro_radiobutton.Cnds.OnFocused);
		}

		OnUnFocusedC(){
			this.Trigger(C3.Behaviors.aekiro_radiobutton.Cnds.OnUnFocused);
		}

		Release()
		{
			super.Release();
		}
	
		SaveToJson()
		{
			return {
				"isEnabled":this.isEnabled,
				"name":this.name,

				"frame_normal":this.frame_normal,
				"frame_hover":this.frame_hover,
				"frame_disabled":this.frame_disabled,
				"frame_focus":this.frame_focus,
				
				"clickSound":this.clickSound,
				"hoverSound":this.hoverSound,
				"focusSound":this.focusSound,

				"clickAnimation":this.clickAnimation,
				"hoverAnimation":this.hoverAnimation,
				"focusAnimation":this.focusAnimation,
				
				"color_normal":this.color_normal,
				"color_hover":this.color_hover,
				"color_clicked":this.color_clicked,
				"color_disabled":this.color_disabled,
				"color_focus":this.color_focus,

				"ignoreInput":this.ignoreInput,

				"initProps":this.initProps
			};
		}
	
		LoadFromJson(o){
			this.isEnabled = o["isEnabled"];
			this.name = o["name"];

			this.frame_normal = o["frame_normal"];
			this.frame_hover = o["frame_hover"];
			this.frame_disabled = o["frame_disabled"];
			this.frame_focus = o["frame_focus"];

			this.clickSound = o["clickSound"];
			this.hoverSound = o["hoverSound"];
			this.focusSound = o["focusSound"];
			
			this.clickAnimation = o["clickAnimation"];
			this.hoverAnimation = o["hoverAnimation"];
			this.focusAnimation = o["focusAnimation"];

			this.color_normal = o["color_normal"];
			this.color_hover = o["color_hover"];
			this.color_clicked = o["color_clicked"];
			this.color_disabled = o["color_disabled"];
			this.color_focus = o["color_focus"];
			
			this.ignoreInput = o["ignoreInput"];
			
			this.initProps = o["initProps"];
			
			this.onInitPropsLoaded();
			this.onPropsLoaded();
		}
	};
	
}
