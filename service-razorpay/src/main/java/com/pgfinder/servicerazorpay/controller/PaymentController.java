package com.pgfinder.servicerazorpay.controller;

import com.pgfinder.servicerazorpay.service.PaymentService;
import com.razorpay.RazorpayException;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*") // Allow requests from any frontend
@RequestMapping("/api/payment")
public class PaymentController {

    private PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "Razorpay Service is Up";
    }

    @PostMapping("/create-order")
    public String createOrder(@RequestParam int amount) throws RazorpayException {
        System.out.println("Received order request for amount: " + amount);
        return paymentService.createOrder(amount);
    }
}
