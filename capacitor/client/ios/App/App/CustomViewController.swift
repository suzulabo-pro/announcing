//
//  CustomViewController.swift
//  App
//
//  Created by suzulabo on 2021/11/04.
//

import UIKit
import Capacitor

class CustomViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        webView?.allowsBackForwardNavigationGestures = true;
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}
