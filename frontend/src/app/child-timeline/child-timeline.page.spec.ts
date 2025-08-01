import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChildTimelinePage } from './child-timeline.page';

describe('ChildTimelinePage', () => {
  let component: ChildTimelinePage;
  let fixture: ComponentFixture<ChildTimelinePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildTimelinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
