"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_button = class aekiro_buttonBehavior extends C3.SDKBehaviorBase
	{
		constructor(a) {
			super(a);
			const b = this._runtime.Dispatcher();
			this._disposables = new C3.CompositeDisposable(
				C3.Disposable.From(b, "pointerdown", (a)=>this._OnPointerDown(a.data)),
				C3.Disposable.From(b, "pointermove", (a)=>this._OnPointerMove(a.data)),
				C3.Disposable.From(b, "pointerup", (a)=>this._OnPointerUp(a.data, !1)),
				C3.Disposable.From(b, "pointercancel", (a)=>this._OnPointerUp(a.data, !0)));
		}
		Release() {
			this._disposables.Release(),
			this._disposables = null,
			super.Release();
		}
		_OnPointerDown(a) {
			this._OnInputDown(a["pointerId"].toString(), a["clientX"] - this._runtime.GetCanvasClientX(), a["clientY"] - this._runtime.GetCanvasClientY())
		}
		_OnPointerMove(a) {
			this._OnInputMove(a["pointerId"].toString(), a["clientX"] - this._runtime.GetCanvasClientX(), a["clientY"] - this._runtime.GetCanvasClientY())
		}
		_OnPointerUp(a) {
			this._OnInputUp(a["pointerId"].toString(), a["clientX"] - this._runtime.GetCanvasClientX(), a["clientY"] - this._runtime.GetCanvasClientY())
		}
		_getProUI() {
			if(!this.proui){
				const objectClass = this.GetRuntime().GetSingleGlobalObjectClassByCtor(C3.Plugins.aekiro_proui);
				if(objectClass){
					this.proui = objectClass.GetSingleGlobalInstance().GetSdkInstance();
				}
			}
			return this.proui;
		}
		async _OnInputDown(source, b, c) {
			const proui = this._getProUI();
			const stopClickPropagation = proui.stopClickPropagation;
			const insts = this.GetInstances();
			const targetInsts = [];
			for (const inst of insts) {
				const wi = inst.GetWorldInfo();
				const beh = inst.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.aekiro_button);
				const layer = wi.GetLayer();
				const [x,y] = layer.CanvasCssToLayer(b, c, wi.GetTotalZElevation());
				beh.setFocused(false);
				if(stopClickPropagation){
					if(wi.ContainsPoint(x, y)){
						targetInsts.push(inst);
					}					
				}else{
					if(beh.OnAnyInputDown){
						await beh.OnAnyInputDown(x,y,source);
					}					
				}

			}

			if(stopClickPropagation){
				targetInsts.sort(function(a, b) {
					return a.GetWorldInfo().GetTotalZElevation() - b.GetWorldInfo().GetTotalZElevation();
				});

				//stopin propagation only concrns visible instances
				const res = targetInsts.filter(s => s.GetWorldInfo().IsVisible() &&  s.GetWorldInfo().GetLayer().IsVisible());
				const topInstance = res[res.length-1];
				const targetInsts2 = [];
				if(topInstance){
					targetInsts2.push(topInstance);
				}
				
				//add instances with ignoreInput = no;
				for (const inst of targetInsts) {
					if(inst.GetUnsavedDataMap().aekiro_button.ignoreInput == 0){
						targetInsts2.push(inst);
					}
				}
				
				for (const inst of targetInsts2) {
					const wi = inst.GetWorldInfo();
					const beh = inst.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.aekiro_button);
					const layer = wi.GetLayer();
					const [x,y] = layer.CanvasCssToLayer(b, c, wi.GetTotalZElevation());
					if(beh.OnAnyInputDown){
						await beh.OnAnyInputDown(x,y,source);
					}
				}
			}
		}
		_OnInputMove(source, b, c) {
			const insts = this.GetInstances();
			for (const inst of insts) {
				const beh = inst.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.aekiro_button);
				/*if (!d.IsEnabled() || !d.IsDragging() || d.IsDragging() && d.GetDragSource() !== a)
					continue;*/
				const wi = inst.GetWorldInfo() 
				  , layer = wi.GetLayer()
				  , [x,y] = layer.CanvasCssToLayer(b, c, wi.GetTotalZElevation());
				if(beh.OnAnyInputMove)
					beh.OnAnyInputMove(x, y,source);
			}
		}
		async _OnInputUp(a,b,c) {
			const insts = this.GetInstances();
			for (const inst of insts) {
				const beh = inst.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.aekiro_button);
				const wi = inst.GetWorldInfo(),
				layer = wi.GetLayer(),
				[x,y] = layer.CanvasCssToLayer(b, c, wi.GetTotalZElevation());
				
				if(beh.OnAnyInputUp)
					await beh.OnAnyInputUp(x,y);
			}
		}
	};
}