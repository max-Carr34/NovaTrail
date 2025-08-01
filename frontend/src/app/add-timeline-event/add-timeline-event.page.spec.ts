import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTimelineEventPage } from './add-timeline-event.page';

describe('AddTimelineEventPage', () => {
  let component: AddTimelineEventPage;
  let fixture: ComponentFixture<AddTimelineEventPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTimelineEventPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
