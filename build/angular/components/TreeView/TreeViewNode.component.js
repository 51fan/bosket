import { Component, Input, ViewChildren, ChangeDetectionStrategy, ChangeDetectorRef, ComponentFactoryResolver } from "@angular/core";
import { ItemInjector } from "./ItemInjector.directive";
import { TreeNode } from "../../../core";
var object = require("../../../tools/objects").object;
var TreeViewNode = (function () {
    function TreeViewNode(_cdRef, _componentFactoryResolver) {
        var _this = this;
        this._cdRef = _cdRef;
        this._componentFactoryResolver = _componentFactoryResolver;
        this._props = {
            get: function () {
                var keys = ["model", "category", "selection", "display", "key", "strategies", "dragndrop",
                    "labels", "sort", "disabled", "noOpener", "async", "css", "folded",
                    "loading", "depth", "ancestors", "searched", "onSelect"];
                var props = {};
                keys.forEach(function (key) {
                    props[key] = _this[key];
                });
                return props;
            },
            set: function (s) {
                for (var key in s) {
                    if (key in _this)
                        _this[key] = s[key];
                }
            }
        };
        this._state = {
            unfolded: [],
            get: function () {
                return { unfolded: _this._state.unfolded };
            },
            set: function (s) {
                for (var key in s) {
                    if (key in _this._state)
                        _this._state[key] = s[key];
                }
            }
        };
        this.noOpener = false;
        this.depth = 0;
        this.getModel = function () {
            return _this.searched ?
                _this.model.filter(function (m) { return _this.filteredModel.has(m); }) :
                _this.model;
        };
        this.getChildModel = function (item) {
            var childModel = item[_this.category];
            if (_this.node.isAsync(item) && !_this.node.isFolded(item) && _this.node.pending.indexOf(item) < 0) {
                _this.node.unwrapPromise(item);
            }
            if (!_this.node.isAsync(item)) {
                childModel = _this.sort ? childModel.sort(_this.sort) : childModel;
            }
            return childModel;
        };
        this.getChildFiltered = function (item) {
            return _this.searched ?
                _this.filteredModel.get(item) :
                null;
        };
        this.ancestorsMap = new Map();
        this.getAncestors = function (item) {
            if (!_this.ancestorsMap.has(item))
                _this.ancestorsMap.set(item, _this.ancestors.concat([item]));
            return _this.ancestorsMap.get(item);
        };
        this.ticking = false;
        this.limitTick = function (fun) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (_this.ticking) {
                window.requestAnimationFrame(function () {
                    fun.apply(void 0, args);
                    _this.ticking = false;
                });
            }
            _this.ticking = true;
        };
        this.invokeEvent = function (name, item, event, condition) {
            if (condition === void 0) { condition = true; }
            var fun = _this.node.getDragEvents(item, condition)[name];
            fun ? fun(event) : null;
        };
        this.node = new TreeNode(this._props, null, this._state, function () { return _this._cdRef.detectChanges(); });
    }
    TreeViewNode.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.model instanceof Array)
            this.model.forEach(function (i) { return _this.ancestorsMap.set(i, _this.ancestors.concat([i])); });
    };
    TreeViewNode.prototype.ngAfterViewChecked = function () {
        this.injectItems();
    };
    TreeViewNode.prototype.injectItems = function () {
        var _this = this;
        if (!this.itemComponent || !this.itemInjectors)
            return;
        var changes = false;
        this.itemInjectors.forEach(function (injector) {
            var item = injector.item;
            if (injector.componentRef) {
                if (injector.componentRef.item === item)
                    return;
                injector.componentRef.item = item;
            }
            else {
                changes = true;
                var componentFactory = _this._componentFactoryResolver.resolveComponentFactory(_this.itemComponent);
                var viewContainerRef = injector.viewContainerRef;
                var componentRef = viewContainerRef.createComponent(componentFactory);
                componentRef.instance.item = item;
                injector.componentRef = componentRef.instance;
            }
        });
        if (changes) {
            this._cdRef.markForCheck();
            this._cdRef.detectChanges();
        }
    };
    TreeViewNode.decorators = [
        { type: Component, args: [{
                    selector: 'TreeViewNode',
                    template: "\n        <ul *ngIf=\"!folded && !loading\"\n            [ngClass]=\"node.ulCss()\"\n            (dragover)=\"limitTick(invokeEvent, 'onDragOver', null, $event, depth === 0)\"\n            (dragenter)=\"invokeEvent('onDragEnter', null, $event, depth === 0)\"\n            (dragleave)=\"invokeEvent('onDragLeave', null, $event, depth === 0)\"\n            (drop)=\"invokeEvent('onDrop', null, $event, depth === 0)\">\n\n            <li *ngFor=\"let item of getModel(); let i = index; trackBy: key\"\n                [class]=\"node.liCss(item)\"\n                (click)=\"node.onClick(item)($event)\"\n                [draggable]=\"node.getDragEvents(item).draggable\"\n                (dragstart)=\"invokeEvent('onDragStart', item, $event)\"\n                (dragover)=\"invokeEvent('onDragOver', item, $event)\"\n                (dragenter)=\"invokeEvent('onDragEnter', item, $event)\"\n                (dragleave)=\"invokeEvent('onDragLeave', item, $event)\"\n                (dragend)=\"invokeEvent('onDragEnd', item, $event)\"\n                (drop)=\"invokeEvent('onDrop', item, $event)\">\n                <span [class]=\"node.mixCss('item')\">\n                    <a *ngIf=\"!itemComponent\">{{ display(item, this.ancestors) }}</a>\n                    <ng-template *ngIf=\"itemComponent\" [itemInjector]=\"item\"></ng-template>\n                    <span\n                        *ngIf=\"node.hasChildren(item) || node.isAsync(item) && !noOpener\"\n                        [class]=\"node.mixCss('opener')\"\n                        (click)=\"node.onOpener(item)($event)\"></span>\n                </span>\n                <TreeViewNode\n                    *ngIf=\"node.hasChildren(item) || node.isAsync(item)\"\n                    [model]=\"getChildModel(item)\"\n                    [filteredModel]=\"getChildFiltered(item)\"\n                    [ancestors]=\"getAncestors(item)\"\n                    [depth]=\"depth + 1\"\n                    [folded]=\"node.isFolded(item)\"\n                    [loading]=\"node.isAsync(item) && !node.isFolded(item)\"\n                    [category]=\"category\"\n                    [selection]=\"selection\"\n                    [onSelect]=\"onSelect\"\n                    [strategies]=\"strategies\"\n                    [labels]=\"labels\"\n                    [display]=\"display\"\n                    [css]=\"css\"\n                    [async]=\"async\"\n                    [dragndrop]=\"dragndrop\"\n                    [sort]=\"sort\"\n                    [disabled]=\"disabled\"\n                    [searched]=\"searched\"\n                    [noOpener]=\"noOpener\"\n                    [itemComponent]=\"itemComponent\">\n                </TreeViewNode>\n            </li>\n        </ul>\n        <span *ngIf=\"loading\"></span>\n    ",
                    changeDetection: ChangeDetectionStrategy.OnPush
                },] },
    ];
    TreeViewNode.ctorParameters = function () { return [
        { type: ChangeDetectorRef, },
        { type: ComponentFactoryResolver, },
    ]; };
    TreeViewNode.propDecorators = {
        'model': [{ type: Input },],
        'category': [{ type: Input },],
        'selection': [{ type: Input },],
        'display': [{ type: Input },],
        'key': [{ type: Input },],
        'strategies': [{ type: Input },],
        'labels': [{ type: Input },],
        'sort': [{ type: Input },],
        'disabled': [{ type: Input },],
        'noOpener': [{ type: Input },],
        'async': [{ type: Input },],
        'itemComponent': [{ type: Input },],
        'dragndrop': [{ type: Input },],
        'filteredModel': [{ type: Input },],
        'css': [{ type: Input },],
        'folded': [{ type: Input },],
        'loading': [{ type: Input },],
        'depth': [{ type: Input },],
        'ancestors': [{ type: Input },],
        'searched': [{ type: Input },],
        'onSelect': [{ type: Input },],
        'itemInjectors': [{ type: ViewChildren, args: [ItemInjector,] },],
    };
    return TreeViewNode;
}());
export { TreeViewNode };
//# sourceMappingURL=TreeViewNode.component.js.map