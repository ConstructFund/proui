"use strict";
{
	const C3 = self.C3;
	C3.Behaviors.aekiro_scrollView = class aekiro_scrollViewBehavior extends C3.SDKBehaviorBase
	{
		constructor(a) {
			super(a);
			const b = this._runtime.Dispatcher();
			this._disposables = new C3.CompositeDisposable(
				C3.Disposable.From(b, "pointerdown", (a)=>this._OnPointerDown(a.data)),
				C3.Disposable.From(b, "pointermove", (a)=>this._OnPointerMove(a.data)),
				C3.Disposable.From(b, "pointerup", (a)=>this._OnPointerUp(a.data, !1)),
				C3.Disposable.From(b, "pointercancel", (a)=>this._OnPointerUp(a.data, !0))),
				C3.Disposable.From(b, "wheel", (a) => this._OnMouseWheel(a.data))
		}
		Release() {
			this._disposables.Release(),
			this._disposables = null,
			super.Release()
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
		_OnMouseWheel(a) {
			this._OnMouseWheel2(a["deltaY"], a["clientX"] - this._runtime.GetCanvasClientX(), a["clientY"] - this._runtime.GetCanvasClientY())
		}
		async _OnInputDown(source, b, c) {
			const insts = this.GetInstances();
			for (const inst of insts) {
				const beh = inst.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.aekiro_scrollView);
				const wi = inst.GetWorldInfo(),
				layer = wi.GetLayer(),
				[x,y] = layer.CanvasCssToLayer(b, c, wi.GetTotalZElevation());
				if(beh.OnAnyInputDown)
					await beh.OnAnyInputDown(x,y,source);
			}
		}
		_OnInputMove(source, b, c) {
			const insts = this.GetInstances();
			for (const inst of insts) {
				const beh = inst.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.aekiro_scrollView);
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
				const beh = inst.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.aekiro_scrollView);
				const wi = inst.GetWorldInfo(),
				layer = wi.GetLayer(),
				[x,y] = layer.CanvasCssToLayer(b, c, wi.GetTotalZElevation());
				
				if(beh.OnAnyInputUp)
					await beh.OnAnyInputUp(x,y);
			}
		}
		_OnMouseWheel2(a,b,c) {
            const insts = this.GetInstances();
			for (const inst of insts) {
				const beh = inst.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.aekiro_scrollView);
				const wi = inst.GetWorldInfo(),
				layer = wi.GetLayer(),
				[x,y] = layer.CanvasCssToLayer(b, c, wi.GetTotalZElevation());
				if(beh.OnMouseWheel)
					beh.OnMouseWheel(x,y,a);
			}
        }
	};
}