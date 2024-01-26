"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_sliderbar.Acts = {
		setEnabled(state){
			this.isEnabled = !!state;
		},
		
		setValue(value){
			this.setValue(value);
		},

		setMaxValue(max){
			if(max == this.maxValue)return;
			
			const barLength = this.getBarLength();
			this.maxValue = max;
			this.widthStep = (this.step/(this.maxValue-this.minValue))*barLength;
			this.thres = this.widthStep*2/3;
			this.precis = this.step/(this.maxValue-this.minValue);
			
			//this.updateView();
			this.setValue(this.value);
		},
		
		setMinValue(min){
			if(min == this.minValue)return;
			
			const barLength = this.getBarLength();
			this.minValue = min;
			this.widthStep = (this.step/(this.maxValue-this.minValue))*barLength;
			this.thres = this.widthStep*2/3;
			this.precis = this.step/(this.maxValue-this.minValue);
			
			//this.updateView();
			this.setValue(this.value);
		},
		
		setStep(step){
			if(step == this.step)return;
			
			this.step = step;
			const barLength = this.getBarLength();
			this.widthStep = (this.step/(this.maxValue-this.minValue))*barLength;
			this.thres = this.widthStep*2/3;
			this.precis = this.step/(this.maxValue-this.minValue);
			
			//this.updateView();
			this.setValue(this.value);
		}
		
	};
	
}
