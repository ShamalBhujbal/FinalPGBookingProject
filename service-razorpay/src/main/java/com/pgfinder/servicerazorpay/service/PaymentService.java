package com.pgfinder.servicerazorpay.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public String createOrder(int amount) throws RazorpayException {
        // Mocking checks if keys are not present to avoid runtime errors during startup without config
        if (keyId == null || keySecret == null) {
            return "Razorpay keys not configured";
        }
        
        RazorpayClient client = new RazorpayClient(keyId, keySecret);
        JSONObject options = new JSONObject();
        options.put("amount", amount * 100); // amount in paise
        options.put("currency", "INR");
        options.put("receipt", "txn_" + System.currentTimeMillis());
        
        Order order = client.orders.create(options);
        return order.get("id").toString();
    }
}
