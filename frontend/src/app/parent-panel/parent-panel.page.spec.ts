import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParentPanelPage } from './parent-panel.page';

describe('ParentPanelPage', () => {
  let component: ParentPanelPage;
  let fixture: ComponentFixture<ParentPanelPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentPanelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
