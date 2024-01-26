"use strict";

{
	C3.Behaviors.MyCompany_MyBehavior = class MyBehavior extends C3.SDKBehaviorBase
	{
		constructor(opts)
		{
			super(opts);
			const b = this._runtime.Dispatcher();
			this._disposables = new C3.CompositeDisposable(
				C3.Disposable.From(b, "pointerdown", (a) => this._OnPointerDown(a.data)),
			 C3.Disposable.From(b, "pointermove", (a) => this._OnPointerMove(a.data)),
			 C3.Disposable.From(b, "pointerup", (a) => this._OnPointerUp(a.data, !1)), 
			 C3.Disposable.From(b, "pointercancel", (a) => this._OnPointerUp(a.data, !0)), 
			 C3.Disposable.From(b, "mousemove", (a) => this._OnMouseMove(a.data)), 
			 C3.Disposable.From(b, "mousedown", (a) => this._OnMouseDown(a.data)), 
			 C3.Disposable.From(b, "mouseup", (a) => this._OnMouseUp(a.data)),
			 C3.Disposable.From(b, "wheel", (a) => this._OnMouseWheel(a.data))
			 )
		}
		
		//this._disposables = new C3.CompositeDisposable(C3.Disposable.From(b, "mousemove", (a)=>this._OnMouseMove(a.data)),C3.Disposable.From(b, "mousedown", (a)=>this._OnMouseDown(a.data)),C3.Disposable.From(b, "mouseup", (a)=>this._OnMouseUp(a.data)),C3.Disposable.From(b, "dblclick", (a)=>this._OnDoubleClick(a.data)),C3.Disposable.From(b, "wheel", (a)=>this._OnMouseWheel(a.data)),C3.Disposable.From(b, "window-blur", ()=>this._OnWindowBlur()))
		//-- Custom Class Functions :: Start

		Release() {
			this._disposables.Release(), this._disposables = null, super.Release()
		}
	
		_OnPointerDown(a) {
			"mouse" === a.pointerType || this._OnInputDown(a.pointerId.toString(), a.clientX - this._runtime.GetCanvasClientX(), a.clientY - this._runtime.GetCanvasClientY())
		}
	
		_OnPointerMove(a) {
			"mouse" === a.pointerType || this._OnInputMove(a.pointerId.toString(), a.clientX - this._runtime.GetCanvasClientX(), a.clientY - this._runtime.GetCanvasClientY())
		}
	
		_OnPointerUp(a) {
			"mouse" === a.pointerType || this._OnInputUp(a.pointerId.toString())
		}
	
		_OnMouseDown(a) {
			0 !== a.button || this._OnInputDown("mouse", a.clientX - this._runtime.GetCanvasClientX(), a.clientY - this._runtime.GetCanvasClientY())
		}
	
		_OnMouseMove(a) {
			0 !== a.button || this._OnInputMove("mouse", a.clientX - this._runtime.GetCanvasClientX(), a.clientY - this._runtime.GetCanvasClientY())
		}
	
		_OnMouseUp(a) {
			0 !== a.button || this._OnInputUp("mouse")
		}

		_OnMouseWheel(a) {
            const b = this.GetInstances();
			for (const c of b) {
				const b = c.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.MyCompany_MyBehavior);
				b._OnMouseWheel(a);
			}
			//console.log(a);
        }
	
		_OnInputDown(a, b, c) {
			const d = this.GetInstances();
			let e = null,
				f = null,
				g = 0,
				h = 0;
			for (const i of d) {
				const a = i.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.MyCompany_MyBehavior);
				//if (!a.IsEnabled() || a.IsDragging()) continue;
				const d = i.GetWorldInfo(), j = d.GetLayer(), [k, l] = j.CanvasCssToLayer(b, c);
				if (!d.ContainsPoint(k, l)) continue;
				if (!e) {
					e = i, f = a, g = k, h = l;
					continue
				}
				const m = e.GetWorldInfo();
				(j.GetIndex() > m.GetLayer().GetIndex() || j.GetIndex() === m.GetLayer().GetIndex() && d.GetZIndex() > m.GetZIndex()) && (e = i, f = a, g = k, h = l)
			}
			e && f._OnDown(a, g, h);
		}
	
		_OnInputMove(a, b, c) {
			const d = this.GetInstances();
			for (const e of d) {
				const d = e.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.MyCompany_MyBehavior);
				//if (!d.IsEnabled() || !d.IsDragging() || d.IsDragging() && d.GetDragSource() !== a) continue;
				const f = e.GetWorldInfo().GetLayer(),
					[g, h] = f.CanvasCssToLayer(b, c);
				d._OnMove(g, h)
			}
		}
	
		_OnInputUp(a) {
			const b = this.GetInstances();
			for (const c of b) {
				const b = c.GetBehaviorSdkInstanceFromCtor(C3.Behaviors.MyCompany_MyBehavior);
				//b.IsDragging() && b.GetDragSource() === a && b._OnUp()
				b._OnUp();
			}
		}
	};
}