// @flow

import React from "react"

import { ComponentSection } from "self/react/components/ComponentSection/ComponentSection"
import { TreeViewWindow } from "./TreeViewWindow"

export const TreeViewSection = () =>
    <ComponentSection
        componentName="Nested lists"
        description={
            <div>
                <p>
                    <span>Demonstrates a basic usage of the TreeView component </span>
                    <span>and how to override and use most of its </span>
                    <em><a href="#TreeView#Required props">component props</a></em>, and&nbsp;
                    <em><a href="#TreeView#Css">css styles</a></em>.
                </p>
                <span>Featuring :</span>
                <ul>
                    <li>- Drag and drop, with a custom drag image.</li>
                    <li>- Asynchronous children loading</li>
                    <li>- Multiselection using keyboard modifiers (shift / ctrl or cmd)</li>
                    <li>- Transitions on fold / unfold</li>
                    <li>- Alphabetical sort</li>
                    <li>- Search bar</li>
                </ul>
            </div>
        }
        files={[
            "./components/Sections/TreeView/TreeViewDemo.js",
            "./components/Sections/TreeView/TreeViewDemo.css",
            "./components/Sections/TreeView/TreeViewWindow.js",
            "../common/models/TreeViewModel.js"
        ]}>
        <TreeViewWindow/>
    </ComponentSection>