import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Int "mo:core/Int";

actor {
  type Certificate = {
    name : Text;
    expiryDate : Time.Time;
  };

  module Certificate {
    public func compare(c1 : Certificate, c2 : Certificate) : Order.Order {
      Text.compare(c1.name, c2.name);
    };

    public func compareByExpiry(c1 : Certificate, c2 : Certificate) : Order.Order {
      switch (Int.compare(c1.expiryDate, c2.expiryDate)) {
        case (#equal) { Text.compare(c1.name, c2.name) };
        case (order) { order };
      };
    };
  };

  type JobStatus = {
    #pending;
    #completed;
    #failed;
  };

  type SigningJob = {
    ipaFilename : Text;
    certificateName : Text;
    status : JobStatus;
  };

  module SigningJob {
    public func compare(job1 : SigningJob, job2 : SigningJob) : Order.Order {
      Text.compare(job1.certificateName, job2.certificateName);
    };
  };

  let certificates = Map.empty<Text, Certificate>();
  let jobs = Map.empty<Text, SigningJob>();
  var jobCounter = 0;

  public shared ({ caller }) func addCertificate(name : Text, expiryDate : Time.Time) : async () {
    if (certificates.containsKey(name)) {
      Runtime.trap("Certificate with this name already exists.");
    };
    let cert : Certificate = {
      name;
      expiryDate;
    };
    certificates.add(name, cert);
  };

  public query ({ caller }) func getCertificates() : async [Certificate] {
    certificates.values().toArray().sort();
  };

  public shared ({ caller }) func submitSigningJob(ipaFilename : Text, certificateName : Text) : async Text {
    switch (certificates.get(certificateName)) {
      case (null) { Runtime.trap("Certificate not found") };
      case (?_) {
        let jobId = "job_" # jobCounter.toText();
        jobCounter += 1;

        let newJob : SigningJob = {
          ipaFilename;
          certificateName;
          status = #pending;
        };

        jobs.add(jobId, newJob);
        jobId;
      };
    };
  };

  public query ({ caller }) func getJobStatus(jobId : Text) : async JobStatus {
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) { job.status };
    };
  };

  public query ({ caller }) func getAllJobs() : async [SigningJob] {
    jobs.values().toArray().sort();
  };

  public query ({ caller }) func getAllJobsByCertificate() : async [SigningJob] {
    jobs.values().toArray().sort();
  };

  public shared ({ caller }) func updateJobStatus(jobId : Text, newStatus : JobStatus) : async () {
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) {
        let updatedJob : SigningJob = {
          job with status = newStatus
        };
        jobs.add(jobId, updatedJob);
      };
    };
  };
};
