"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_scrollView.Acts = {		
		ScrollTo(targetX,targetY,targetType,smooth){
			this.scrollTo(targetX,targetY,targetType,smooth);
		},
		ScrollBy(distanceX,distanceY,targetType,smooth){
			this.scrollBy(distanceX,distanceY,targetType,smooth);
		},
		setEnabled(isEnabled){
			this.isEnabled = isEnabled;
		}
	
	};
}
